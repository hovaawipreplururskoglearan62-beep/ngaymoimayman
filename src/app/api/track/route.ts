import { TELEGRAM_CONFIG } from '@/utils/telegram';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.ip || 'Unknown IP';
        const userAgent = req.headers.get('user-agent') || 'Unknown UA';

        // Lọc bot cơ bản của Facebook, Google, v.v.
        const botKeywords = ['bot', 'crawler', 'spider', 'facebookexternalhit', 'google', 'vercel', 'headless'];
        const isBot = botKeywords.some(keyword => userAgent.toLowerCase().includes(keyword));

        // Nếu là bot và KHÔNG có cài đặt phòng BOTS thì bỏ qua
        if (isBot && !process.env.TELEGRAM_BOT_TOPIC_ID) {
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

        let message = `🔥 <b>[NEW TRAFFIC]</b>\n\n🎯 <b>IP:</b> ${ip}\n🌍 <b>Location:</b> ${geoInfo}\n📱 <b>Browser:</b> ${userAgent}`;
        
        if (isBot) {
            message = `🤖 <b>[BOT DETECTED]</b>\n\n🎯 <b>IP:</b> ${ip}\n🌍 <b>Location:</b> ${geoInfo}\n📱 <b>Browser:</b> ${userAgent}`;
        }

        const url = `${TELEGRAM_CONFIG.API_URL}/sendMessage`;
        const payload: any = { 
            text: message, 
            parse_mode: 'HTML' 
        };

        // Chuyển hướng tin nhắn tùy theo loại (Bot hay Người thật)
        if (isBot && process.env.TELEGRAM_BOT_TOPIC_ID) {
            payload.message_thread_id = parseInt(process.env.TELEGRAM_BOT_TOPIC_ID, 10);
        } else if (!isBot && process.env.TELEGRAM_TRAFFIC_TOPIC_ID) {
            payload.message_thread_id = parseInt(process.env.TELEGRAM_TRAFFIC_TOPIC_ID, 10);
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
