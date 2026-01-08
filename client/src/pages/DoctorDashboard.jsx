
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/api';
import { Button, Input, Card } from '../components/UI';
import { Search, Save, History, FileText } from 'lucide-react';

const DoctorDashboard = () => {
    const { t } = useLanguage();
    const [hid, setHid] = useState('');
    const [patient, setPatient] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        blood_group: '',
        blood_summary: '',
        injuries: '',
        allergies: '',
        remarks: '',
        next_visit: ''
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const fetchPatient = async () => {
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            const res = await api.post('/doctor/get_patient', { health_id: hid });
            setPatient(res.data);
            setHistory(res.data.history);

            // Pre-fill latest report if exists
            if (res.data.history.length > 0) {
                const latest = res.data.history[0];
                setFormData(prev => ({
                    ...prev,
                    blood_group: latest.blood_group || '',
                    blood_summary: latest.blood_summary || '',
                    injuries: latest.injuries || '',
                    allergies: latest.allergies || '',
                    remarks: latest.remarks || '',
                    next_visit: '' // Always reset date
                }));
            }
        } catch (error) {
            setPatient(null);
            setMsg({ type: 'error', text: t('patient_not_found') });
        }
        setLoading(false);
    };

    const submitRecord = async () => {
        if (!hid) return;
        setLoading(true);
        try {
            // Create payload, handle optional date
            const payload = {
                health_id: hid,
                next_visit: formData.next_visit || null,
                ...formData
            };

            await api.post('/doctor/add_record', payload);
            setMsg({ type: 'success', text: t('record_added') });
            fetchPatient(); // Refresh
        } catch (error) {
            setMsg({ type: 'error', text: t('conn_error') });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background pb-10">
            <Navbar titleKey="welcome_doctor" />

            <div className="container mx-auto mt-8 px-4 grid gap-6 md:grid-cols-3">
                {/* Find Patient */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            {t('patient_lookup')}
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="HID-..."
                                value={hid}
                                onChange={(e) => setHid(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={fetchPatient} disabled={loading}>
                                {loading ? '...' : t('fetch_btn')}
                            </Button>
                        </div>

                        {msg.text && (
                            <div className={`p-3 rounded text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {msg.text}
                            </div>
                        )}

                        {patient && (
                            <div className="mt-6 bg-blue-50 p-4 rounded-lg border-l-4 border-secondary">
                                <h3 className="font-bold text-lg">{patient.name}</h3>
                                <div className="text-secondary text-sm font-mono">{hid}</div>
                                <div className="text-gray-500 text-sm mt-1">{patient.phone} | {patient.language}</div>

                                <Button
                                    variant="outline"
                                    className="w-full mt-4 text-xs"
                                    onClick={() => setShowHistory(true)}
                                >
                                    <History className="w-4 h-4" />
                                    {t('view_previous_reports')}
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Report Form */}
                <div className="md:col-span-2">
                    <Card className={!patient ? 'opacity-50 pointer-events-none' : ''}>
                        <h2 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {t('create_report')}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-1">
                                <label className="text-sm font-semibold text-gray-600 block mb-1">{t('blood_group')}</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                                    value={formData.blood_group}
                                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                >
                                    <option value="">-</option>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label={t('blood_summary')}
                                value={formData.blood_summary}
                                onChange={(e) => setFormData({ ...formData, blood_summary: e.target.value })}
                            />
                            <Input
                                label={t('injuries')}
                                className="md:col-span-2"
                                value={formData.injuries}
                                onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                            />
                            <Input
                                label={t('allergies')}
                                className="md:col-span-2"
                                value={formData.allergies}
                                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                            />
                            <Input
                                label={t('remarks')}
                                className="md:col-span-2"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />

                            <Input
                                type="date"
                                label={`${t('next_visit')} (Optional)`}
                                className="md:col-span-1"
                                value={formData.next_visit}
                                onChange={(e) => setFormData({ ...formData, next_visit: e.target.value })}
                            />
                        </div>

                        <Button className="w-full mt-6" onClick={submitRecord} disabled={loading || !patient}>
                            <Save className="w-4 h-4" />
                            {t('save_record')}
                        </Button>
                    </Card>
                </div>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl">{t('post_history')} ({t('recent_history')})</h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-red-500">✕</button>
                        </div>
                        <div className="space-y-4">
                            {history.length === 0 && <p className="text-gray-500 text-center py-4">{t('no_records')}</p>}
                            {history.map((h, i) => (
                                <div key={i} className="border-l-4 border-primary pl-4 py-2 bg-gray-50 rounded-r">
                                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                                        <span>{h.created_at?.split('T')[0]}</span>
                                        <span className="font-mono">Dr. {h.doctor_id}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="font-semibold">Blood:</span> {h.blood_group}</div>
                                        <div><span className="font-semibold">Summary:</span> {h.blood_summary}</div>
                                        <div className="col-span-2"><span className="font-semibold">Injuries:</span> {h.injuries}</div>
                                        <div className="col-span-2"><span className="font-semibold">Allergies:</span> {h.allergies}</div>
                                        <div className="col-span-2"><span className="font-semibold">Remarks:</span> {h.remarks}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
