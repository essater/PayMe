💸 PayMe – React Native Mobil Ödeme Uygulaması
🎓 Bitirme Projesi

PayMe, kullanıcıların dijital ortamda para gönderme, ödeme alma ve QR kod aracılığıyla işlem yapma imkânı sunan modern bir mobil ödeme uygulamasıdır.
Bu proje, bitirme projem olarak geliştirilmiş olup, React Native ve Firebase teknolojileri kullanılarak hem iOS hem Android platformlarında çalışacak şekilde tasarlanmıştır.
Amaç, gerçek bir mobil ödeme altyapısının kullanıcı deneyimine dayalı bir simülasyonunu gerçekleştirmektir.

🖼️ Uygulama Görselleri
<p align="center"> <img src="screens/login.jpg" width="230" /> <img src="screens/register.jpg" width="230" /> <img src="screens/home.jpg" width="230" /> </p> <p align="center"> <img src="screens/transactions.jpg" width="230" /> <img src="screens/qrscan.jpg" width="230" /> <img src="screens/qrmycode.jpg" width="230" /> </p>

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

İsmail Es Satır
🎓 Bitirme Projesi | Frontend & Mobile Developer
📬 GitHub Profilim

🏷️ Lisans

Bu proje eğitim ve portföy amacıyla geliştirilmiştir.
Ticari amaçlarla kullanılamaz veya dağıtılamaz.
