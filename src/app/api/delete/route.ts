import { TELEGRAM_CONFIG } from '@/utils/telegram';
import { NextRequest, NextResponse } from 'next/server';

const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { message_id } = body;

        if (!message_id) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const url = `${TELEGRAM_CONFIG.API_URL}/deleteMessage`;
        const payload = {
            message_id: message_id
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return NextResponse.json({
            success: response.ok && data.ok
        });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
};

export { POST };



