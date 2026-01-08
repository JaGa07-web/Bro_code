
import unittest
import json
from app import app, migrate_db
import uuid

class PersistenceTestCase(unittest.TestCase):
    def setUp(self):
        self.ctx = app.app_context()
        self.ctx.push()
        self.client = app.test_client()
        migrate_db() # Ensure DB is migrated

    def tearDown(self):
        self.ctx.pop()

    def test_persistence_flow(self):
        # 1. Create Worker
        phone = str(uuid.uuid4())[:10]
        res_reg = self.client.post('/signup', json={
            'name': 'Persuist Worker',
            'phone': phone,
            'role': 'worker'
        })
        hid = res_reg.json['health_id']

        # 2. Doctor Adds Structured Report
        with self.client.session_transaction() as sess:
            sess['user_id'] = 999
            sess['role'] = 'doctor'

        report_data = {
            'health_id': hid,
            'next_visit': '2027-01-01',
            'blood_group': 'AB+',
            'blood_summary': 'Hb:14',
            'injuries': 'None',
            'allergies': 'Dust',
            'remarks': 'Good health'
        }
        res_add = self.client.post('/doctor/add_record', json=report_data)
        self.assertEqual(res_add.status_code, 200)

        # 3. Doctor Fetch Patient (Check History)
        res_fetch = self.client.post('/doctor/get_patient', json={'health_id': hid})
        history = res_fetch.json['history']
        self.assertTrue(len(history) > 0)
        latest = history[0]
        self.assertEqual(latest['blood_group'], 'AB+')
        self.assertEqual(latest['allergies'], 'Dust')

        # 4. Worker Dashboard (Check Display)
        # Login as worker
        self.client.post('/login', json={'phone': phone})
        
        res_dash = self.client.get('/worker/dashboard')
        data = res_dash.json
        rec = data['medical_record']
        self.assertEqual(rec['blood_group'], 'AB+')
        self.assertEqual(rec['allergies'], 'Dust')

if __name__ == '__main__':
    unittest.main()
