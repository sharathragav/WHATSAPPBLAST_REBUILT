import os
import pandas as pd
from werkzeug.utils import secure_filename

def allowed_file(filename, allowed_extensions):
    """Check if file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def validate_excel_file(file_path):
    """Validate Excel file structure"""
    try:
        # Try to read the Excel file
        df = pd.read_excel(file_path)
        
        if df.empty:
            raise ValueError("Excel file is empty")
        
        # Check if there's at least one column that could be contacts
        if len(df.columns) == 0:
            raise ValueError("Excel file has no columns")
        
        # Look for contact-like columns
        contact_columns = []
        for col in df.columns:
            col_lower = str(col).lower().strip()
            if any(keyword in col_lower for keyword in ['contact', 'phone', 'number', 'mobile']):
                contact_columns.append(col)
        
        if not contact_columns and len(df.columns) < 1:
            raise ValueError("No valid contact column found")
        
        return True, "Valid Excel file"
        
    except Exception as e:
        return False, str(e)

def clean_filename(filename):
    """Clean and secure filename"""
    return secure_filename(filename)

def get_file_size(file_path):
    """Get file size in bytes"""
    return os.path.getsize(file_path)

def cleanup_file(file_path):
    """Remove file safely"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False
