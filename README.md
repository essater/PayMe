💸 PayMe – React Native Mobil Ödeme Uygulaması
🎓 Bitirme Projesi

PayMe, kullanıcıların dijital ortamda para gönderme, ödeme alma ve QR kod aracılığıyla işlem yapma imkânı sunan modern bir mobil ödeme uygulamasıdır.
Bu proje, bitirme projem olarak geliştirilmiş olup, React Native ve Firebase teknolojileri kullanılarak hem iOS hem Android platformlarında çalışacak şekilde tasarlanmıştır.
Amaç, gerçek bir mobil ödeme altyapısının kullanıcı deneyimine dayalı bir simülasyonunu gerçekleştirmektir.

🖼️ Uygulama Görselleri
<p align="center"> !![3633bd16-6d2a-4103-9709-bd6febdaf1a4](https://github.com/user-attachments/assets/124dc58b-9a35-4205-8f10-382bad3b0f55)
[8eefd8f4-![bd4d847c-12d4-4507-be66-e8ae3a9553c6](https:![4eaca6d8-fc94-4a9f-92f1-3236ee005439](https://github.com/user-attachments/assets/17109580-3f97-493e-a128-66a44aa9ad![a456715a-f88d-4ed9-9d6a-fd596088736a](https://github.com/user-attachments/assets/8414a31e-0462-4e0e-a34d-39a2451![d3995cf4-d60d-417f-9e05-82646d58adf9](https://github.com/user-attachments/assets/facc45cc-a232-401e-a6e2-fc80b9db5f95)
f4e25![8672ceb3-f308-4ab8-b6f9-334c7d011dfc](https://github.com/user-attachments/assets/c85eedd3-affe-4f2a-8b28-744ec2dda18b)
)
38)![8057cbb1-c63c-4c1f-a348-14b738a1b0cd](https://github.com/user-attachments/assets/0b12e367-6f55-4f67-952b-4d5e83d5c5c3)

//github.com/user-attachments/assets/94fdeaa6-424e-48df-8ec3-17db4cded9e4)
58fc-4f91-bb37-e7e42b154b27](https://github.com/user-attachments/assets/dcddae05-2eec-4d50-9faf-323f89d456d9)
 </p>

💡 Görseller: Giriş, kayıt, ana sayfa, QR ödeme ve işlem geçmişi ekranları.

⚙️ Kullanılan Teknolojiler

React Native (Expo) – Mobil uygulama geliştirme

JavaScript (ES6+) – İş mantığı ve state yönetimi

Firebase Authentication & Firestore – Kullanıcı yönetimi ve gerçek zamanlı veri tabanı

React Navigation – Sayfa yönlendirme ve tab yapısı

MVVM Mimarisi – Temiz ve sürdürülebilir kod yapısı

Notification Service – Bildirim sistemi

QR Code Entegrasyonu – Hızlı ve güvenli ödeme paylaşımı

📱 Özellikler

🔐 Kullanıcı kayıt ve giriş sistemi (Firebase Auth)

✉️ E-posta doğrulama süreci

💸 Para transferi ve ödeme isteği gönderimi

📷 QR kod oluşturma ve okutma

👥 Arkadaş listesi yönetimi (ekleme, silme, düzenleme)

🔔 Gerçek zamanlı bildirimler

📊 İşlem geçmişi görüntüleme ve filtreleme

🌗 Modern ve sade kullanıcı arayüzü

🧩 Proje Mimarisi
src/
 ┣ 📁 models/          → Veri modelleri
 ┣ 📁 navigation/      → Sayfa yönlendirme sistemi
 ┣ 📁 services/        → Firebase ve Notification servisleri
 ┣ 📁 utils/           → Yardımcı fonksiyonlar
 ┣ 📁 viewmodels/      → MVVM katmanı (iş mantığı)
 ┣ 📁 views/           → Ekranlar (Login, Signup, Transfer, QR, Profile, vb.)
 ┗ 📄 App.js           → Uygulama giriş noktası

🚀 Kurulum ve Çalıştırma

Depoyu klonla:

git clone https://github.com/essater/PayMe.git


Dizine gir ve bağımlılıkları yükle:

cd PayMe
npm install


Expo’yu başlat:

npx expo start


Mobil cihazında veya emülatörde uygulamayı test et. 📱

🎯 Projenin Amacı

Bu proje, mobil ödeme sistemlerinin temel mimarisini, kullanıcı doğrulama süreçlerini ve
gerçek zamanlı veri yönetimini anlamak amacıyla geliştirilmiştir.
Geliştirme sürecinde; React Native, Firebase, form doğrulama, bildirim servisleri ve QR tabanlı işlemler üzerine derinlemesine pratik yapılmıştır.

🔮 Geliştirme Fikirleri

Gerçek ödeme API entegrasyonu (Stripe / PayPal)

Push notification sistemi

Karanlık tema desteği

Çoklu dil desteği (i18n)

Profil fotoğrafı ve kişiselleştirme

👨‍💻 Geliştirici

İsmail Esat Erbay
🎓 Bitirme Projesi | Frontend & Mobile Developer

🏷️ Lisans

Bu proje eğitim ve portföy amacıyla geliştirilmiştir.
Ticari amaçlarla kullanılamaz veya dağıtılamaz.
