# replit.md

## Overview

WhatsApp Bulk Sender is a web application that automates bulk messaging through WhatsApp Web using Selenium WebDriver. It provides a React-based frontend for users to upload recipient Excel files, attach media files, and monitor the sending progress in real-time. The system uses Chrome browser automation to interact with WhatsApp Web and send personalized messages to multiple contacts efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom WhatsApp-themed color variables
- **UI Components**: Custom component library with shadcn/ui-inspired design patterns
- **File Handling**: Drag-and-drop file upload interface with validation

### Backend Architecture
- **Framework**: Flask with Python for the REST API server
- **Web Automation**: Selenium WebDriver with Chrome browser automation
- **File Processing**: pandas and openpyxl for Excel file parsing and validation
- **Session Management**: Flask session handling with configurable secret keys
- **CORS Support**: Flask-CORS for cross-origin resource sharing
- **Threading**: Background thread execution for non-blocking message sending operations

### Data Processing
- **File Validation**: Multi-layer validation for Excel files and attachment formats
- **Contact Management**: Automatic detection of contact columns in Excel files
- **Progress Tracking**: Real-time progress monitoring with success/failure statistics
- **Logging System**: Comprehensive logging with timestamps and categorized message types

### Browser Automation
- **Profile Integration**: Uses existing Chrome user profiles to maintain WhatsApp Web authentication
- **Retry Logic**: Configurable retry mechanisms for failed message attempts
- **Timeout Management**: Multiple timeout configurations for different operations (upload, chat loading, message sending)
- **Error Handling**: Robust exception handling for WebDriver interactions

### API Design
- **RESTful Endpoints**: Clean separation of concerns with dedicated endpoints for sending, progress tracking, and status monitoring
- **File Upload**: Multipart form handling for Excel recipients and media attachments
- **Real-time Updates**: Polling-based progress updates with configurable intervals
- **Error Responses**: Structured error messages with appropriate HTTP status codes

### Configuration Management
- **Environment Variables**: Chrome profile paths and session secrets via environment variables
- **Centralized Config**: Single configuration file for timeouts, file size limits, and operational parameters
- **Development vs Production**: Separate configurations for different deployment environments

## External Dependencies

### Core Dependencies
- **Selenium WebDriver**: Browser automation framework for WhatsApp Web interaction
- **ChromeDriverManager**: Automatic Chrome driver management and updates
- **pandas**: Excel file processing and data manipulation
- **openpyxl/xlrd**: Excel file format support for .xlsx and .xls files

### Frontend Dependencies  
- **React Query (TanStack)**: Server state management and API caching
- **Wouter**: Lightweight routing solution
- **Lucide React**: Icon library for UI components
- **Tailwind CSS**: Utility-first CSS framework

### Backend Dependencies
- **Flask**: Web framework and API server
- **Flask-CORS**: Cross-origin resource sharing support
- **Werkzeug**: WSGI utilities and file upload handling
- **Pillow**: Image processing capabilities for attachment validation

### Browser Integration
- **Google Chrome**: Primary browser for WhatsApp Web automation
- **Chrome User Data**: Integration with existing Chrome profiles for authentication persistence
- **WhatsApp Web**: External service dependency for message delivery

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type-safe JavaScript development
- **Python Logging**: Built-in logging framework for operation tracking