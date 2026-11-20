import os
import http.server
import socketserver

PORT = 3001
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Strip query string and fragment
        path = self.path.split('?')[0].split('#')[0]
        
        # Check if requesting root
        if path == '/' or path == '':
            return super().do_GET()

        # If path does not have an extension and is not a dir, check for .html
        local_path = os.path.join(DIRECTORY, path.lstrip('/'))
        if not os.path.exists(local_path) and not os.path.splitext(path)[1]:
            html_path = local_path + '.html'
            if os.path.exists(html_path):
                self.path = path + '.html'

        return super().do_GET()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    with ThreadedHTTPServer(("", PORT), CleanURLHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        httpd.serve_forever()
