# ELK-STACK
Logging of CRUD operations is designed with REST API created with 3 different services. ( Python, Node.js, and .NET Core )


API Loglarının ELK Kullanarak İşlenmesi ve Database Bağlantısı Yapılması


Bu rapor, Python FastAPI, Node.js Express ve .NET Core Serilog kullanarak geliştirilen RESTful API'lerin geliştirilmesi ve uygulanmasını detaylandırmaktadır. Her bir API, CRUD (Oluşturma, Okuma, Güncelleme, Silme) işlemlerini gerçekleştirir, istekleri ve işlemleri Elasticsearch üzerinden ELK stack ile loglar ve kalıcı depolama için bir MongoDB veritabanına bağlanır.

1. Kullanılan Teknolojiler
    a. Python (FastAPI)
        •	Framework: FastAPI
        •	Veritabanı: MongoDB
        •	Loglama: Python logging modülü ile özel JSON biçimlendirici
        •	ELK Stack: Elasticsearch log depolama, Kibana log görselleştirme için kullanıldı
        •	İşlemler: Kullanıcı verileri üzerinde CRUD işlemleri
     b. Node.js (Express)
        •	Framework: Express.js
        •	Veritabanı: MongoDB (Mongoose kullanarak)
        •	Loglama: Axios, Elasticsearch'e log göndermek için özel bir taşıyıcı ile birlikte kullanıldı
        •	ELK Stack: Merkezi loglama için Elasticsearch kullanıldı
        •	İşlemler: Kullanıcı verileri üzerinde CRUD işlemleri
     c. .NET Core
        •	Framework: ASP.NET Core
        •	Veritabanı: MongoDB
        •	Loglama: Serilog, Elasticsearch'e log gönderme ile
        •	ELK Stack: Merkezi loglama ve görselleştirme için Elasticsearch ve Kibana kullanıldı
        •	İşlemler: Kullanıcı verileri üzerinde CRUD işlemleri



2. Detaylı Uygulama
      a. Python FastAPI Uygulaması
        •	MongoDB Entegrasyonu:
          o	pymongo kullanarak yerel MongoDB örneğine bağlandı.
          o	Veritabanı: pythonDB
          o	Koleksiyon: users
        •	Loglama Yapılandırması:
          o	Logları JSON dizeleri olarak biçimlendirmek için özel bir JSONFormatter uygulandı.
          o	Loglar, Elasticsearch API'ye HTTP POST istekleri yapılarak Elasticsearch'e gönderildi.
        •	API Uç Noktaları:
          o	GET /api/users: MongoDB'den tüm kullanıcıları getirir.
          o	POST /api/users: Yeni bir kullanıcı kaydeder, benzersiz bir ID atar ve MongoDB'ye kaydeder.
          o	DELETE /api/users/{user_id}: Belirli bir ID'ye sahip kullanıcıyı MongoDB'den siler.
        •	Hata Yönetimi:
          o	Farklı hata senaryoları için uygun durum kodları ile HTTPException kullanılarak hata yönetimi uygulanmıştır.
        •	Loglama Örneği:
          o	Her istek için, JSON formatında bir log oluşturulur ve merkezi depolama için Elasticsearch'e gönderilir.


      b. Node.js Express Uygulaması
        •	MongoDB Entegrasyonu:
          o	Mongoose kullanarak MongoDB'ye bağlanıldı.
          o	Modeller, Mongoose şemaları kullanılarak tanımlandı.
        •	Loglama Yapılandırması:
          o	axios kullanılarak loglama yapıldı ve özel bir taşıyıcı ile loglar Elasticsearch'e gönderildi.
          o	Loglar, istek detayları ile zenginleştirildi (uç nokta, yöntem, zaman damgası gibi).

        •	API Uç Noktaları:
          o	GET /api/users: MongoDB'den tüm kullanıcıları getirir.
          o	POST /api/users: Yeni bir kullanıcı kaydeder ve MongoDB'ye kaydeder.
          o	DELETE /api/users/:userId: Belirli bir ID'ye sahip kullanıcıyı MongoDB'den siler.
        •	Loglama İçin Orta Katman (Middleware):
          o	Gelen istekleri yakalayan ve ilgili detayları kaydeden bir middleware kullanıldı.
        •	Loglama Örneği:
          o	Loglar, erişilen uç nokta, kullanılan yöntem ve işlemin durumu gibi detayları içerir. Loglar, daha sonra alınmak ve analiz edilmek üzere Elasticsearch'te depolanır.
   
      c. .NET Core Serilog Uygulaması
        •	MongoDB Entegrasyonu:
          o	Özel bir MongoService sınıfı kullanılarak MongoDB'ye bağlanıldı.
          o	Veritabanı işlemleri için MongoDB.Driver kullanıldı.
        •	Loglama Yapılandırması:
          o	Serilog, olayları Elasticsearch'e loglamak için yapılandırıldı ve ek bağlam özellikleri ile zenginleştirildi.
          o	Loglar, zaman damgası ve istek detayları ile zenginleştirildi.
        •	API Uç Noktaları:
          o	GET /api/users: MongoDB'den tüm kullanıcıları getirir.
          o	POST /api/users: Yeni bir kullanıcı kaydeder ve MongoDB'ye kaydeder.
          o	DELETE /api/users/{id}: Belirli bir ID'ye sahip kullanıcıyı MongoDB'den siler.
        •	Hata Yönetimi:
          o	Hatalar ve istisnalar, hata türü ve konumu hakkında ek bilgilerle birlikte Serilog kullanılarak loglanır.
        •	Loglama Örneği:
          o	Her API çağrısı, kendi indeksine gönderilen bir log kaydı ile sonuçlanır.


4. Merkezi Loglama ile ELK Stack Kullanımı
   Loglama kurulumunun merkezi bileşeni, tüm hizmetlerden gelen logların depolandığı Elasticsearch'tür. Bu loglar, Kibana kullanılarak görselleştirilebilir ve analiz edilebilir. Python FastAPI, Node.js Express ve .NET       Core'dan gelen loglar, ortak bir Elasticsearch dizininde (api-logs) depolanır ve bu, farklı hizmetler arasında birleştirilmiş bir analiz sağlar.
        •	Ortak Loglama Alanları:
          o	timestamp: Logun oluşturulduğu zaman, ISO 8601 formatında.
          o	endpoint: Erişilen API uç noktası.
          o	method: Kullanılan HTTP yöntemi (GET, POST, DELETE vb.).
          o	message: Gerçekleştirilen işlemin veya sonucun açıklaması.
          o	status: İşlemin başarısını veya başarısızlığını belirtir.



5. Sonuç
   Bu proje, farklı teknoloji yığınları (Python, Node.js, .NET) kullanılarak geliştirilen RESTful API'lerin ve bu hizmetlerin merkezi bir ELK stack ile loglama ve izleme entegrasyonunu göstermektedir. Her hizmet,       
   kullanıcı verileri üzerinde benzer CRUD işlemleri gerçekleştirir ve bu işlemleri Elasticsearch'e loglar, böylece Kibana kullanılarak kapsamlı bir izleme ve analiz yapılmasına imkan tanır. 
   Tüm hizmetlerde MongoDB'nin kullanılması, tutarlı veri depolama ve geri alma uygulamalarını sağlar. Bu yaklaşım, gelecekte ek hizmetlerin veya loglama yeteneklerinin kolayca genişletilebileceği veya
   eğiştirilebileceği ölçeklenebilir ve sürdürülebilir bir mimari sağlar.
