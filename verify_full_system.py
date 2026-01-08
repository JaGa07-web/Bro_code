
import unittest
import json
from app import app

class FullSystemTestCase(unittest.TestCase):
    def setUp(self):
        self.ctx = app.app_context()
        self.ctx.push()
        self.client = app.test_client()

    def tearDown(self):
        self.ctx.pop()

    def test_frontend_files_served(self):
        # Check if all HTML files are reachable
        routes = ['/', '/login.html', '/admin.html', '/doctor.html', '/worker.html']
        for route in routes:
            response = self.client.get(route)
            self.assertEqual(response.status_code, 200, f"Failed to serve {route}")

    def test_login_flow(self):
        # Test clean string
        res = self.client.post('/login', json={'phone': '111'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['role'], 'admin')

        # Test string with space
        res = self.client.post('/login', json={'phone': ' 222 '})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['role'], 'doctor')
        
        # Test failure
        res = self.client.post('/login', json={'phone': '000'})
        self.assertEqual(res.status_code, 401)

    def test_admin_register_worker(self):
        # Mock login as admin
        with self.client.session_transaction() as sess:
            sess['user_id'] = 1
            sess['role'] = 'admin'
        
        res = self.client.post('/admin/register_worker', json={
            'name': 'Test Worker',
            'phone': '333',
            'language': 'ta'
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn('health_id', res.json)

if __name__ == '__main__':
    unittest.main()
