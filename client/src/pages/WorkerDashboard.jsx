
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/api';
import { Card } from '../components/UI';
import { Fingerprint, Bell, FileText } from 'lucide-react';

const WorkerDashboard = () => {
    const { t } = useLanguage();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/worker/dashboard'); // Backend route
                setData(res.data);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };
        load();
    }, []);

    const renderValue = (val) => {
        return val || <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">{t('nil_value')}</span>;
    };

    if (loading) return <div className="p-8 text-center">{t('loading')}</div>;
    if (!data) return <div className="p-8 text-center text-red-500">{t('conn_error')}</div>;

    const { medical_record, notifications, health_id } = data;

    return (
        <div className="min-h-screen bg-background pb-10">
            <Navbar titleKey="welcome_worker" />

            <div className="container mx-auto mt-8 px-4 flex flex-col items-center gap-6">
                {/* Health ID Card */}
                <div className="w-full max-w-2xl bg-gradient-to-br from-primary to-gray-800 text-white rounded-xl shadow-lg p-6 text-center transform hover:scale-[1.02] transition">
                    <div className="flex justify-center mb-3">
                        <Fingerprint className="w-10 h-10 opacity-80" />
                    </div>
                    <h2 className="text-white/60 uppercase tracking-wider text-sm mb-1">{t('your_hid')}</h2>
                    <div className="text-3xl font-mono font-bold tracking-widest">{health_id}</div>
                </div>

                {/* Medical Report */}
                <Card className="w-full max-w-2xl">
                    <div className="flex items-center gap-2 mb-6 text-primary border-b pb-4">
                        <FileText className="w-6 h-6" />
                        <h2 className="text-xl font-bold">{t('report_summary')}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center">
                            <span className="text-sm font-semibold text-gray-500">{t('blood_group')}</span>
                            <div className="col-span-2 font-bold text-lg">{renderValue(medical_record?.blood_group)}</div>
                        </div>
                        <div className="border-t pt-3 grid grid-cols-3 items-center">
                            <span className="text-sm font-semibold text-gray-500">{t('blood_summary')}</span>
                            <div className="col-span-2 text-gray-700">{renderValue(medical_record?.blood_summary)}</div>
                        </div>
                        <div className="border-t pt-3 grid grid-cols-3 items-center">
                            <span className="text-sm font-semibold text-gray-500">{t('injuries')}</span>
                            <div className="col-span-2 text-gray-700">{renderValue(medical_record?.injuries)}</div>
                        </div>
                        <div className="border-t pt-3 grid grid-cols-3 items-center">
                            <span className="text-sm font-semibold text-gray-500">{t('allergies')}</span>
                            <div className="col-span-2 text-red-500 font-medium">{renderValue(medical_record?.allergies)}</div>
                        </div>
                        <div className="border-t pt-3 grid grid-cols-3 items-center">
                            <span className="text-sm font-semibold text-gray-500">{t('remarks')}</span>
                            <div className="col-span-2 text-blue-600">{renderValue(medical_record?.remarks)}</div>
                        </div>
                    </div>

                    {medical_record?.created_at && (
                        <div className="mt-6 text-right text-xs text-gray-400">
                            {t('last_updated')}: {medical_record.created_at.split('T')[0]}
                        </div>
                    )}
                </Card>

                {/* Notifications */}
                <div className="w-full max-w-2xl">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        {t('my_notifications')}
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{notifications.length}</span>
                    </h3>

                    <div className="space-y-3">
                        {notifications.length === 0 && (
                            <div className="text-gray-400 text-center py-6 bg-white rounded-lg border border-dashed">
                                {t('no_notifs')}
                            </div>
                        )}
                        {notifications.map((n, i) => (
                            <Card key={i} className="flex items-center p-4 !py-4">
                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full mr-4">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{t('doc_update')}</h4>
                                    <p className="text-gray-600 text-sm">{n.message}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
