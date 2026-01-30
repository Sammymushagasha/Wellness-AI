#!/usr/bin/env python3
"""
Simple CORS proxy server for Claude API
No Node.js required - just Python!
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error

# Your API configuration
CLAUDE_API_KEY = 'Your API goes here'
CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
PORT = 3000

class ProxyHandler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests to /api/messages"""
        if self.path == '/api/messages':
            try:
                # Read request body
                content_length = int(self.headers['Content-Length'])
                body = self.rfile.read(content_length)
                
                # Prepare request to Claude API
                headers = {
                    'Content-Type': 'application/json',
                    'x-api-key': CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01'
                }
                
                # Make request to Claude API
                req = urllib.request.Request(
                    CLAUDE_API_URL,
                    data=body,
                    headers=headers,
                    method='POST'
                )
                
                # Get response
                with urllib.request.urlopen(req) as response:
                    response_data = response.read()
                    
                    # Send response back to client
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(response_data)
                    
                print(f"Request successful")
                
            except urllib.error.HTTPError as e:
                # API error (401, 429, etc.)
                error_body = e.read().decode('utf-8')
                print(f"API Error {e.code}: {error_body}")
                
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(error_body.encode())
                
            except Exception as e:
                # Server error
                print(f"Server Error: {str(e)}")
                error_response = json.dumps({
                    'error': {'message': str(e)}
                }).encode()
                
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(error_response)
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        """Custom logging"""
        if '200' in str(args):
            return
        print(f"Request: {format % args}")

if __name__ == '__main__':
    server = HTTPServer(('localhost', PORT), ProxyHandler)
    print('=' * 60)
    print('Python Proxy Server Running!')
    print('=' * 60)
    print(f'Proxy URL: http://localhost:{PORT}/api/messages')
    print(f'Using API Key: {CLAUDE_API_KEY[:20]}...')
    print(f'\nServer is ready!')
    print(f'Now open your website in Live Server')
    print(f'Keep this terminal window open')
    print('\nPress Ctrl+C to stop the server')
    print('=' * 60)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n\nShutting down proxy server...')
        server.shutdown()