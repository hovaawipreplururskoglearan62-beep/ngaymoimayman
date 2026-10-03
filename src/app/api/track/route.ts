import { TELEGRAM_CONFIG } from '@/utils/telegram';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.ip || 'Unknown IP';
        const userAgent = req.headers.get('user-agent') || 'Unknown UA';

        // Lọc bot cơ bản của Facebook, Google, v.v.
        const botKeywords = ['bot', 'crawler', 'spider', 'facebookexternalhit', 'google', 'vercel', 'headless'];
        const isBot = botKeywords.some(keyword => userAgent.toLowerCase().includes(keyword));

        if (isBot) {
            return NextResponse.json({ success: true, note: 'ignored bot' });
        }

        // Lấy thông tin quốc gia/nhà mạng từ IP
        let geoInfo = '';
        try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip.split(',')[0]}`);
            const geoData = await geoRes.json();
            if (geoData.status === 'success') {
                geoInfo = `${geoData.country} (${geoData.isp})`;
            }
        } catch (e) {
            geoInfo = 'Unknown Location';
        }

        const message = `🔥 <b>[NEW TRAFFIC]</b>\n\n🎯 <b>IP:</b> ${ip}\n🌍 <b>Location:</b> ${geoInfo}\n📱 <b>Browser:</b> ${userAgent}`;

        const url = `${TELEGRAM_CONFIG.API_URL}/sendMessage`;
        const payload: any = { 
            text: message, 
            parse_mode: 'HTML' 
        };

        // Nếu có cài đặt ID của phòng Traffic thì gửi vào phòng đó
        if (process.env.TELEGRAM_TRAFFIC_TOPIC_ID) {
            payload.message_thread_id = process.env.TELEGRAM_TRAFFIC_TOPIC_ID;
        }

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
