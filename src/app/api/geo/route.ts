import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const headersList = await headers();
        // Lấy IP từ headers (hỗ trợ cả môi trường proxy/load balancer)
        const ip = headersList.get('cf-connecting-ip') || 
                   headersList.get('x-forwarded-for')?.split(',')[0].trim() || 
                   headersList.get('x-real-ip') || 
                   'unknown';

        if (ip === 'unknown') {
            return NextResponse.json({ country_code: 'VN', ip: 'unknown' });
        }

        // Gọi GeoJS để lấy thông tin địa lý
        const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`, {
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            return NextResponse.json({ country_code: 'VN', ip });
        }

        const data = await response.json();
        return NextResponse.json({
            ip: data.ip,
            country: data.country,
            country_code: data.country_code?.toUpperCase() || 'VN',
            city: data.city,
            region: data.region,
            timezone: data.timezone,
            asn: Number(data.asn),
            organization: data.organization
        });
    } catch (error) {
        console.error('Geo API Error:', error);
        return NextResponse.json({ country_code: 'VN' }, { status: 200 });
    }
}
