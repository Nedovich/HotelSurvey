# Guest Verify Integration

Bu proje artik `roomNumber + birthDate` ile harici bir guest verify servisine baglanacak sekilde hazirlandi.

## Uygulama tarafinda degisenler

- Public verify formu artik:
  - `Oda Numarasi`
  - `Dogum Tarihi`
  ile calisiyor.
- Verify basarili olursa sistem su alanlari response kaydina yaziyor:
  - ad
  - soyad
  - oda numarasi
  - dogum tarihi
  - ulke
  - check-in
  - check-out
- Response detail ekraninda bu alanlar artik dinamik gosteriliyor.

## Harici servis beklentisi

Hotelsurvey su endpoint'i cagirir:

```env
HOTELSURVEY_GUEST_VERIFY_URL="http://127.0.0.1/guest-verify/verify.php"
```

Beklenen request:

```json
{
  "hotelId": "hotel-id",
  "publicSlug": "untitled-survey-2-abc123",
  "roomNumber": "101",
  "birthDate": "1997-06-18"
}
```

Beklenen response:

```json
{
  "verified": true,
  "guestDisplayName": "VICTORIA SAWAQED",
  "guestFirstName": "VICTORIA",
  "guestLastName": "SAWAQED",
  "roomNumber": "101",
  "birthDate": "1997-06-18",
  "checkInDate": "2026-05-27",
  "checkOutDate": "2026-05-29",
  "country": "Jordan",
  "externalReference": null
}
```

veya:

```json
{
  "verified": false,
  "reason": "not_found"
}
```

## Servis dosyalari

Sunucuya kopyalanacak hazir PHP servis dosyalari:

- `/Users/nedimeskinazi/Documents/GitHub/Kreatin/HotelSurvey/backup/guest-verify-service/verify.php`
- `/Users/nedimeskinazi/Documents/GitHub/Kreatin/HotelSurvey/backup/guest-verify-service/health.php`
- `/Users/nedimeskinazi/Documents/GitHub/Kreatin/HotelSurvey/backup/guest-verify-service/config.example.php`

## Not

`backup` klasoru git ignore altindadir. Bu yuzden deploy icin o dosyalar lokalde mevcut olsa da versiyon kontrolde takip edilmez. Kalici dokuman icin bu dosya repoda tutuluyor.
