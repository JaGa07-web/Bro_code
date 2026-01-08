
import unittest
import json
from app import app
import uuid

class FeatureTestCase(unittest.TestCase):
    def setUp(self):
        self.ctx = app.app_context()
        self.ctx.push()
        self.client = app.test_client()

    def tearDown(self):
        self.ctx.pop()

    def test_signup_flow(self):
        # Generate random phone to avoid conflict
        phone = str(uuid.uuid4())[:10]
        
        # Signup as Worker
        res = self.client.post('/signup', json={
            'name': 'New Worker',
            'phone': phone,
            'role': 'worker',
            'language': 'en'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['role'], 'worker')
        self.assertIn('health_id', res.json)
        
        # Verify login works with new creds
        res_login = self.client.post('/login', json={'phone': phone})
        self.assertEqual(res_login.status_code, 200)

    def test_doctor_fetch_patient(self):
        # 1. Signup a worker to get HID
        phone = str(uuid.uuid4())[:10]
        res_signup = self.client.post('/signup', json={
            'name': 'Patient Zero',
            'phone': phone,
            'role': 'worker'
        })
        hid = res_signup.json['health_id']

        # 2. Login as Doctor
        with self.client.session_transaction() as sess:
            sess['user_id'] = 999
            sess['role'] = 'doctor'

        # 3. Fetch Patient details
        res = self.client.post('/doctor/get_patient', json={'health_id': hid})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['name'], 'Patient Zero')
        self.assertEqual(res.json['phone'], phone)

if __name__ == '__main__':
    unittest.main()
