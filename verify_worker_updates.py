
import unittest
import json
from app import app
import uuid
import re

class WorkerDashboardTestCase(unittest.TestCase):
    def setUp(self):
        self.ctx = app.app_context()
        self.ctx.push()
        self.client = app.test_client()

    def tearDown(self):
        self.ctx.pop()

    def test_worker_dashboard_data(self):
        # 1. Create a Worker
        phone = str(uuid.uuid4())[:10]
        res_signup = self.client.post('/signup', json={
            'name': 'Test Worker',
            'phone': phone,
            'role': 'worker'
        })
        hid = res_signup.json['health_id']
        worker_id = self.client.post('/login', json={'phone': phone}).json.get('role') # Just checking login works
        
        # 2. Add a Medical Report as Doctor
        with self.client.session_transaction() as sess:
            sess['user_id'] = 999
            sess['role'] = 'doctor'
        
        report_diag = "[REPORT] Blood: O+ | Stats: Normal | Injuries: None"
        report_pres = "Allergies: Peanuts | Remarks: Healthy"
        
        res_add = self.client.post('/doctor/add_record', json={
            'health_id': hid,
            'diagnosis': report_diag,
            'prescription': report_pres,
            'next_visit': '2027-01-01'
        })
        self.assertEqual(res_add.status_code, 200)

        # 3. Login as the Worker again
        self.client.post('/login', json={'phone': phone})
        
        # 4. Check Dashboard Data
        res_dash = self.client.get('/worker/dashboard')
        data = res_dash.json
        
        self.assertEqual(data['health_id'], hid)
        self.assertIsNotNone(data['medical_record'])
        self.assertEqual(data['medical_record']['diagnosis'], report_diag)
        self.assertEqual(data['medical_record']['prescription'], report_pres)

if __name__ == '__main__':
    unittest.main()
