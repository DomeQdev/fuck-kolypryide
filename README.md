# 🖕 Fuck KolyPryide

Proste narzędzie CLI do pobierania danych GTFS z systemu KolyPryide.com.ua. Bo informacja o transporcie publicznym, finansowana z naszych podatków, powinna być wolna.

## ▶️ Użycie

Wystarczy jedno polecenie. Wymaga posiadania [Node.js](https://nodejs.org/).

```bash
npx kolypryide-gtfs
```

## 🤔 Dlaczego to powstało?

Bo czasami trzeba. A tak na poważnie, ten projekt jest odpowiedzią na absurdalne i szkodliwe praktyki firmy **Operibus Sp. z o.o.**, która stała się "gatekeeperem" dostępu do danych o polskim transporcie publicznym.

Program powstał między innymi po tym, jak przedstawiciel Grodziskich Przewozów Autobusowych, Pan Jerzy, poinformował mnie:

> *"natomiast nie jest planowane raczej konyunuowanie udostepniania danych zarowno GTFS, jak i GTFS real time"*

To stwierdzenie jest o tyle ciekawe, że w umowie zawartej między GPA a Operibus (którą możecie znaleźć [tutaj](https://cdn.zbiorkom.live/public/operibus-gpa.pdf)) w punkcie **5.8.1** stoi jak byk:

> *"Na wniosek Zamawiającego, Wykonawca zobowiązany jest (...) do udostępniania i przekazywania podmiotom zewnętrznym (...) danych elektronicznych z aktualnymi rozkładami jazdy w formacie GTFS..."*

Powstał też po to, żeby żaden samorząd w Polsce nie musiał już płacić firmie Operibus dziesiątek tysięcy złotych za tak podstawową rzecz, jak udostępnienie **WŁASNYCH** rozkładów jazdy do Google Maps. Tak, dobrze czytacie – potrafią żądać za to dodatkowych opłat.

## 🎯 Po co Ci te dane?

Wiadomo, że Google Maps nie przyjmie plików GTFS od losowej osoby z internetu – musi to zrobić sam przewoźnik (któremu często utrudnia to jego własny dostawca IT).

**Ale... [zbiorkom.live](https://zbiorkom.live/) chętnie takie dane przyjmie! ❤️**

## ⚖️ Czy to w ogóle legalne?

Dobre pytanie! Przeanalizujmy to:

*   **Scraping nie jest nielegalny.** W polskim prawie nie ma przepisów, które wprost zakazywałyby pobierania publicznie dostępnych (nawet jeśli niedokumentowanych) informacji. Ten program odpytuje publicznie dostępne API, z którego korzysta strona KolyPryide.com.ua.
*   **Rozkłady jazdy to informacja publiczna.** Nie pozwólcie sobie wmówić, że firma Operibus ma jakiekolwiek prawa autorskie do rozkładu jazdy autobusu w Waszym mieście. Twórcą i właścicielem rozkładu jest **organizator transportu (gmina, powiat, związek)**, a jego finansowanie pochodzi z **naszych podatków**. To są dane publiczne. Kropka.
*   **Stan na 28.06.2025 r.:** Używanie tego programu **w celach niekomercyjnych, do pozyskiwania informacji publicznej**, nie narusza, w naszej ocenie, żadnych obowiązujących przepisów. Jednakże, nie jesteśmy kancelarią prawną. **Używasz tego narzędzia na własną odpowiedzialność.** Jego celem jest promowanie transparentności i otwartego dostępu do danych.
