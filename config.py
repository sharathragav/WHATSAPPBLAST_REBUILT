import os

CONFIG = {
    # WebDriver settings
    'max_retries': 3,
    'delay_between_messages': 30,  # seconds between messages
    'upload_timeout': 60,          # seconds for file upload
    'chat_load_timeout': 45,       # seconds to wait for chat to load
    'message_send_timeout': 40,    # seconds to wait for message to send

    # Chrome profile settings
    'user_data_dir': os.environ.get('CHROME_USER_DATA_DIR', ''),
    'profile_name': os.environ.get('CHROME_PROFILE_NAME', 'Default'),
    
    # API settings
    'upload_folder': 'uploads',
    'max_file_size': 16 * 1024 * 1024,  # 16MB max file size
    
    # Logging
    'log_level': 'DEBUG',
    'log_file': 'whatsapp_sender.log'
}
