import os
import logging
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from sender import WhatsAppBulkSender
from utils.file_handler import allowed_file, validate_excel_file

# Create blueprint
api_bp = Blueprint('api', __name__)

# Global sender instance
sender = WhatsAppBulkSender()

@api_bp.route('/send', methods=['POST'])
def send_messages():
    """Start the message sending process"""
    try:
        # Check if process is already active
        if sender.is_active:
            return jsonify({'error': 'A sending process is already active'}), 400
        
        # Check if files are present
        if 'recipientsFile' not in request.files:
            return jsonify({'error': 'Recipients file is required'}), 400
        
        recipients_file = request.files['recipientsFile']
        attachment_file = request.files.get('attachmentFile')
        
        if recipients_file.filename == '':
            return jsonify({'error': 'No recipients file selected'}), 400
        
        # Validate recipients file
        if not allowed_file(recipients_file.filename, ['xlsx', 'xls']):
            return jsonify({'error': 'Recipients file must be Excel format (.xlsx or .xls)'}), 400
        
        # Save recipients file
        if not recipients_file.filename:
            return jsonify({'error': 'Recipients file name is invalid'}), 400
        recipients_filename = secure_filename(recipients_file.filename)
        recipients_path = os.path.join(current_app.config['UPLOAD_FOLDER'], recipients_filename)
        recipients_file.save(recipients_path)
        
        # Validate Excel file structure
        try:
            recipients_df = sender.load_recipient_data(recipients_path)
            if recipients_df.empty:
                return jsonify({'error': 'Recipients file is empty or has no valid contacts'}), 400
        except Exception as e:
            return jsonify({'error': f'Invalid Excel file: {str(e)}'}), 400
        
        # Handle attachment file
        attachment_path = None
        if attachment_file and attachment_file.filename != '':
            if not allowed_file(attachment_file.filename, ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx', 'txt']):
                return jsonify({'error': 'Invalid attachment file format'}), 400
            
            if not attachment_file.filename:
                return jsonify({'error': 'Attachment file name is invalid'}), 400
            attachment_filename = secure_filename(attachment_file.filename)
            attachment_path = os.path.join(current_app.config['UPLOAD_FOLDER'], attachment_filename)
            attachment_file.save(attachment_path)
        
        # Start processing
        sender.process_recipients(recipients_df, attachment_path)
        
        return jsonify({
            'message': 'Message sending process started successfully',
            'total_recipients': len(recipients_df)
        }), 200
        
    except Exception as e:
        logging.error(f"Error starting send process: {str(e)}")
        return jsonify({'error': f'Failed to start sending process: {str(e)}'}), 500

@api_bp.route('/progress', methods=['GET'])
def get_progress():
    """Get current progress status"""
    try:
        progress = sender.get_progress()
        return jsonify(progress), 200
    except Exception as e:
        logging.error(f"Error getting progress: {str(e)}")
        return jsonify({'error': 'Failed to get progress'}), 500

@api_bp.route('/status', methods=['GET'])
def get_status():
    """Get final status after completion"""
    try:
        progress = sender.get_progress()
        return jsonify({
            'is_active': progress['is_active'],
            'completed': not progress['is_active'] and progress['total'] > 0,
            'total_processed': progress['current'],
            'success_count': progress['success_count'],
            'failure_count': progress['failure_count'],
            'logs': progress['logs']
        }), 200
    except Exception as e:
        logging.error(f"Error getting status: {str(e)}")
        return jsonify({'error': 'Failed to get status'}), 500

@api_bp.route('/stop', methods=['POST'])
def stop_process():
    """Stop the current sending process"""
    try:
        sender.stop_process()
        return jsonify({'message': 'Sending process stopped'}), 200
    except Exception as e:
        logging.error(f"Error stopping process: {str(e)}")
        return jsonify({'error': 'Failed to stop process'}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'is_active': sender.is_active if sender else False
    }), 200
