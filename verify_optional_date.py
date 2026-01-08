
import unittest
import json
from app import app, migrate_db
import uuid

class OptionalDateTestCase(unittest.TestCase):
    def setUp(self):
        self.ctx = app.app_context()
        self.ctx.push()
        self.client = app.test_client()
        migrate_db() # Ensure DB is migrated

    def tearDown(self):
        self.ctx.pop()

    def test_optional_date_logic(self):
        # 1. Create Worker
        phone = str(uuid.uuid4())[:10]
        res_reg = self.client.post('/signup', json={
            'name': 'NoDate Worker',
            'phone': phone,
            'role': 'worker'
        })
        hid = res_reg.json['health_id']
        worker_id = self.client.post('/login', json={'phone': phone}).json.get('role')

        # 2. Doctor Adds Report WITHOUT Date
        with self.client.session_transaction() as sess:
            sess['user_id'] = 999
            sess['role'] = 'doctor'

        report_data = {
            'health_id': hid,
            'next_visit': '', # Empty string simulation
            'blood_group': 'O+',
            'remarks': 'No follow up needed'
        }
        res_add = self.client.post('/doctor/add_record', json=report_data)
        self.assertEqual(res_add.status_code, 200, "Should succeed with empty date")

        # 3. Check Notification Count (Should be 0)
        self.client.post('/login', json={'phone': phone})
        res_dash = self.client.get('/worker/dashboard')
        notifs = res_dash.json['notifications']
        self.assertEqual(len(notifs), 0, "No notification should be created")

        # 4. Doctor Adds Report WITH Date
        with self.client.session_transaction() as sess:
            sess['user_id'] = 999
            sess['role'] = 'doctor'
            
        report_data_with_date = {
            'health_id': hid,
            'next_visit': '2027-05-20',
            'remarks': 'Follow up'
        }
        res_add_2 = self.client.post('/doctor/add_record', json=report_data_with_date)
        self.assertEqual(res_add_2.status_code, 200)

        # 5. Check Notification Count (Should be 1)
        self.client.post('/login', json={'phone': phone})
        res_dash_2 = self.client.get('/worker/dashboard')
        notifs_2 = res_dash_2.json['notifications']
        self.assertEqual(len(notifs_2), 1, "One notification should be created")
        self.assertIn('2027-05-20', notifs_2[0]['message'])

if __name__ == '__main__':
    unittest.main()
