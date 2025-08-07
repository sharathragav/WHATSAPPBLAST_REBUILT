import os
import time
import pandas as pd
import threading
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from datetime import datetime
from config import CONFIG

class WhatsAppBulkSender:
    def __init__(self):
        self.driver = None
        self.config = CONFIG
        self.is_active = False
        self.current = 0
        self.total = 0
        self.success_count = 0
        self.failure_count = 0
        self.logs = []
        self.thread = None

    def add_log(self, message, log_type="info"):
        """Add a log entry with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        self.logs.append(log_entry)
        logging.info(f"{log_type.upper()}: {message}")

    def initialize_driver(self):
        """Initialize Chrome WebDriver with profile support"""
        self.add_log("Initializing Chrome WebDriver...")
        options = webdriver.ChromeOptions()
        
        # Add existing profile configuration
        user_data_dir = self.config.get('user_data_dir', '')
        profile_name = self.config.get('profile_name', 'Default')
        
        if user_data_dir and os.path.exists(user_data_dir):
            if profile_name and profile_name != 'Default':
                profile_path = os.path.join(user_data_dir, profile_name)
            else:
                profile_path = user_data_dir
            options.add_argument(f'--user-data-dir={profile_path}')
            self.add_log(f"Using Chrome profile: {profile_path}")
        
        # Chrome options for automation
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-infobars')
        options.add_argument('--disable-notifications')
        options.add_argument('--start-maximized')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--log-level=3')
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=options)
            self.add_log("Chrome WebDriver initialized successfully")
            return True
        except Exception as e:
            self.add_log(f"Failed to initialize WebDriver: {str(e)}", "error")
            return False

    def login_to_whatsapp(self):
        """Login to WhatsApp Web"""
        self.add_log("Connecting to WhatsApp Web...")
        try:
            if self.driver is None:
                self.add_log("WebDriver not initialized", "error")
                return False
            self.driver.get('https://web.whatsapp.com')
            
            # Check if already logged in
            try:
                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.XPATH, '//div[@id="pane-side"]'))
                )
                self.add_log("Using existing WhatsApp session")
                return True
            except TimeoutException:
                self.add_log("No existing session found - QR scan required")
            
            # Wait for QR scan
            self.add_log("Please scan QR code in the browser window...")
            try:
                WebDriverWait(self.driver, 120).until(
                    EC.presence_of_element_located((By.ID, 'pane-side'))
                )
                self.add_log("Login successful!")
                return True
            except TimeoutException:
                self.add_log("Login timed out. Please try again.", "error")
                return False
        except Exception as e:
            self.add_log(f"Login failed: {str(e)}", "error")
            return False

    def load_recipient_data(self, file_path):
        """Load recipient data from Excel file"""
        self.add_log(f"Loading recipients from {os.path.basename(file_path)}...")
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Find contact column
            contact_column = None
            for col in df.columns:
                if col.strip().lower() in ['contact', 'phone', 'number', 'mobile']:
                    contact_column = col
                    break
            
            if contact_column is None:
                # Use first column if no contact column found
                contact_column = df.columns[0]
                self.add_log(f"No 'Contact' column found. Using '{contact_column}' column")
            
            # Rename to standard 'Contact' column
            df.rename(columns={contact_column: 'Contact'}, inplace=True)
            
            # Clean contact numbers
            df['Contact'] = df['Contact'].astype(str).str.replace(r'\D', '', regex=True)
            
            # Add Message column if not exists
            if 'Message' not in df.columns:
                df['Message'] = ''
            
            df['Message'] = df['Message'].fillna('').astype(str)
            
            # Filter out empty contacts
            df = df[df['Contact'].str.len() > 0]
            
            self.add_log(f"Successfully loaded {len(df)} recipients")
            return df
        except Exception as e:
            self.add_log(f"Error loading recipient data: {str(e)}", "error")
            raise

    def send_message(self, contact, message, attachment_path=None):
        """Send message to a contact"""
        try:
            if self.driver is None:
                self.add_log("WebDriver not initialized", "error")
                return False
                
            self.add_log(f"Sending message to {contact}...")
            
            # Navigate to chat
            self.driver.get(f'https://web.whatsapp.com/send?phone={contact}')
            
            # Wait for chat to load
            try:
                if self.driver is None:
                    return False
                WebDriverWait(self.driver, self.config['chat_load_timeout']).until(
                    EC.any_of(
                        EC.presence_of_element_located((By.XPATH, '//div[@role="textbox" and @contenteditable="true"]')),
                        EC.presence_of_element_located((By.XPATH, '//div[contains(text(), "not on WhatsApp")]'))
                    )
                )
            except TimeoutException:
                self.add_log(f"Chat loading timed out for {contact}", "error")
                return False
            
            # Check if number is invalid
            invalid_number = self.driver.find_elements(By.XPATH, '//div[contains(text(), "not on WhatsApp")]')
            if invalid_number:
                self.add_log(f"❌ {contact} is not registered on WhatsApp", "error")
                return False
            
            # Send attachment if provided
            if attachment_path and os.path.exists(attachment_path):
                if not self._send_attachment(attachment_path, message):
                    return False
            elif message:
                if not self._send_text_message(message):
                    return False
            
            # Wait for message delivery confirmation
            try:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, '//span[@data-icon="msg-dblcheck"]'))
                )
            except TimeoutException:
                pass  # Message might still be sent
            
            self.add_log(f"✅ Message sent successfully to {contact}")
            return True
            
        except Exception as e:
            self.add_log(f"❌ Failed to send message to {contact}: {str(e)}", "error")
            return False

    def _send_attachment(self, file_path, caption):
        """Send attachment with optional caption"""
        try:
            # Click attach button
            clip_btn = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, '//div[@title="Attach"]'))
            )
            clip_btn.click()
            
            # Upload file
            file_input = self.driver.find_element(By.XPATH, '//input[@accept="*"]')
            file_input.send_keys(os.path.abspath(file_path))
            
            # Wait for upload to complete
            try:
                WebDriverWait(self.driver, self.config['upload_timeout']).until(
                    EC.element_to_be_clickable((By.XPATH, "//span[@data-icon='send']"))
                )
            except TimeoutException:
                self.add_log("Attachment upload timed out", "error")
                return False
            
            # Add caption if provided
            if caption:
                try:
                    caption_box = self.driver.find_element(
                        By.XPATH, '//div[@contenteditable="true" and @data-tab="10"]'
                    )
                    caption_box.send_keys(caption)
                except:
                    pass  # Caption box might not be available for all file types
            
            # Send
            send_btn = self.driver.find_element(By.XPATH, "//span[@data-icon='send']")
            send_btn.click()
            
            time.sleep(self.config['delay_between_messages'])
            return True
            
        except Exception as e:
            self.add_log(f"Attachment sending failed: {str(e)}", "error")
            return False

    def _send_text_message(self, message):
        """Send text message"""
        try:
            # Find message input box
            text_box = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, '//div[@role="textbox" and @contenteditable="true"]'))
            )
            
            # Clear and send message
            text_box.send_keys(Keys.CONTROL + "a")
            text_box.send_keys(Keys.DELETE)
            
            # Handle multiline messages
            lines = message.split('\n')
            for i, line in enumerate(lines):
                text_box.send_keys(line)
                if i < len(lines) - 1:  # Not the last line
                    text_box.send_keys(Keys.SHIFT + Keys.ENTER)
            
            # Send message
            text_box.send_keys(Keys.ENTER)
            time.sleep(self.config['delay_between_messages'])
            return True
            
        except Exception as e:
            self.add_log(f"Text message sending failed: {str(e)}", "error")
            return False

    def process_recipients(self, recipients_df, attachment_path=None):
        """Process all recipients in a separate thread"""
        def _process():
            try:
                self.is_active = True
                self.current = 0
                self.total = len(recipients_df)
                self.success_count = 0
                self.failure_count = 0
                self.logs = []
                
                self.add_log(f"Starting to process {self.total} recipients...")
                
                # Initialize WebDriver
                if not self.initialize_driver():
                    self.add_log("Failed to initialize WebDriver", "error")
                    return
                
                # Login to WhatsApp
                if not self.login_to_whatsapp():
                    self.add_log("Failed to login to WhatsApp", "error")
                    return
                
                # Process each recipient
                for index, row in recipients_df.iterrows():
                    if not self.is_active:  # Check if stopped
                        break
                        
                    contact = str(row['Contact']).strip()
                    message = str(row['Message']).strip() if row['Message'] else ""
                    
                    if not contact:
                        continue
                    
                    self.current = index + 1
                    
                    # Attempt to send message with retries
                    success = False
                    for attempt in range(self.config['max_retries']):
                        try:
                            if self.send_message(contact, message, attachment_path):
                                success = True
                                self.success_count += 1
                                break
                            else:
                                if attempt < self.config['max_retries'] - 1:
                                    time.sleep(2)  # Wait before retry
                        except Exception as e:
                            self.add_log(f"Attempt {attempt + 1} failed for {contact}: {str(e)}", "error")
                            time.sleep(2)
                    
                    if not success:
                        self.failure_count += 1
                    
                    # Small delay between contacts
                    time.sleep(1)
                
                self.add_log(f"Process completed! Success: {self.success_count}, Failed: {self.failure_count}")
                
            except Exception as e:
                self.add_log(f"Process failed: {str(e)}", "error")
            finally:
                self.is_active = False
                if self.driver:
                    try:
                        self.driver.quit()
                    except:
                        pass
                    self.driver = None
        
        # Start processing in a new thread
        self.thread = threading.Thread(target=_process)
        self.thread.daemon = True
        self.thread.start()

    def get_progress(self):
        """Get current progress status"""
        return {
            'is_active': self.is_active,
            'current': self.current,
            'total': self.total,
            'success_count': self.success_count,
            'failure_count': self.failure_count,
            'logs': self.logs.copy()
        }

    def stop_process(self):
        """Stop the current process"""
        self.is_active = False
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None
