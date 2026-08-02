# Home Assistant इंटीग्रेशन

इस गाइड में बताया गया है कि Marinara Engine को Home Assistant से कैसे जोड़ें। जुड़ जाने के बाद आपके AI कैरेक्टर सीधे चैट से असली स्मार्ट होम डिवाइस चला सकते हैं। वे लाइट, क्लाइमेट, कवर और मीडिया प्लेयर संभाल लेते हैं। इसी कनेक्शन से Home Assistant के ऑटोमेशन भी Marinara में संदेश भेज सकते हैं।

Home Assistant स्मार्ट होम डिवाइस चलाने का एक मुफ़्त, ओपन सोर्स प्लैटफ़ॉर्म है। अगर आप Home Assistant नहीं चलाते, तो इस इंटीग्रेशन की ज़रूरत नहीं है।

## यह इंटीग्रेशन क्या करता है

इंटीग्रेशन एक छोटा सॉफ़्टवेयर है जो Home Assistant के अंदर इंस्टॉल होता है। यह चालू Home Assistant को चालू Marinara Engine सर्वर से जोड़ देता है। इंस्टॉल होने के बाद यह तीन काम अपने आप करता है:

- यह Marinara के अंदर स्मार्ट होम टूल बनाता है। ये Presets पैनल (प्रीसेट) के **Functions** (फ़ंक्शन) सेक्शन में दिखते हैं। Marinara इन्हें "custom tools" या "Functions" कहता है। फ़ंक्शन आम तौर पर कैसे काम करते हैं, यह [कस्टम टूल](../extending/custom-tools.md) में देखें।
- यह Marinara के अंदर **Home Assistant** नाम का एक AI एजेंट बनाता है। एजेंट यानी वह AI मददगार जो आपकी चैट के साथ-साथ चलता है। देखें [एजेंट: आपकी चैट में मदद करने वाले AI](../agents/agents-overview.md)।
- यह Home Assistant की कई एंटिटी बनाता है, ताकि Marinara पर Home Assistant की तरफ़ से नज़र रखी जा सके और उसे चलाया जा सके। एंटिटी यानी Home Assistant का कोई डिवाइस, सेंसर या कंट्रोल।

टूल के पते कॉपी करने या टूल हाथ से सेट करने की कभी ज़रूरत नहीं पड़ती। पहले सेटअप में ही इंटीग्रेशन सब कुछ आपस में जोड़ देता है।

## पहले से क्या चाहिए

शुरू करने से पहले जाँच लें कि ये सब मौजूद हैं।

- चालू Home Assistant, वर्ज़न 2024.1.0 या उससे नया।
- Home Assistant में HACS इंस्टॉल हो। HACS यानी Home Assistant Community Store, वह टूल जिससे बिल्ट-इन न होने वाले कस्टम इंटीग्रेशन इंस्टॉल किए जाते हैं।
- Marinara Engine इंस्टॉल हो, चल रहा हो और आपकी Home Assistant मशीन से उस तक पहुँच हो। डिफ़ॉल्ट पता `localhost:7860` है। अगर Home Assistant किसी दूसरे डिवाइस पर चलता है, तो पासवर्ड वाला नीचे का नोट पढ़ें।
- Marinara की `.env` फ़ाइल में `WEBHOOK_LOCAL_URLS_ENABLED=true` सेटिंग जुड़ी हो।

`.env` फ़ाइल Marinara सर्वर की सादा टेक्स्ट सेटिंग्स फ़ाइल है। यह कहाँ रहती है और इसे कैसे बदलें, यह [सर्वर कॉन्फ़िगरेशन रेफ़रेंस](../CONFIGURATION.md) में देखें।

आखिरी सेटिंग इसलिए ज़रूरी है, क्योंकि इंटीग्रेशन एक वेबहुक इस्तेमाल करता है। वेबहुक यानी वह वेब पता जिससे एक ऐप दूसरे ऐप को अपने आप डेटा भेज सकता है। Home Assistant का वेबहुक पता लोकल और सादा `http` पता होता है। सुरक्षा के लिए Marinara लोकल `http` पतों पर होने वाली कॉल डिफ़ॉल्ट रूप से रोक देता है। `WEBHOOK_LOCAL_URLS_ENABLED=true` सेट करने पर उन्हें छूट मिल जाती है।

अपनी `.env` फ़ाइल में यह पंक्ति जोड़ें:

```
WEBHOOK_LOCAL_URLS_ENABLED=true
```

यह सेटिंग कुछ ही सेकंड में लागू हो जाती है। Marinara सर्वर दोबारा शुरू करने की ज़रूरत नहीं है।

### अगर Home Assistant किसी दूसरे डिवाइस पर चलता है

इंटीग्रेशन बिना यूज़रनेम और पासवर्ड के Marinara से जुड़ता है। सेटअप फ़ॉर्म में इन्हें भरने की जगह ही नहीं है। इसीलिए यह मायने रखता है कि Home Assistant कहाँ चल रहा है:

- अगर Home Assistant और Marinara एक ही मशीन पर चलते हैं, तो कनेक्शन बिना किसी बदलाव के काम करता है।
- अगर Home Assistant किसी दूसरे डिवाइस पर चलता है, तो Marinara डिफ़ॉल्ट रूप से कनेक्शन रोक देता है। ऐसे में उस Home Assistant डिवाइस को बिना पासवर्ड जुड़ने की छूट देनी होगी। एक तरीका यह है कि उस डिवाइस का IP पता Marinara की `.env` फ़ाइल के `IP_ALLOWLIST` में जोड़ दें। IP पता यानी आपके नेटवर्क पर किसी डिवाइस का नंबर वाला पता। पूरी तरह भरोसेमंद घरेलू नेटवर्क पर इसकी जगह `ALLOW_UNAUTHENTICATED_PRIVATE_NETWORK=true` भी सेट कर सकते हैं।
- अगर Marinara `BASIC_AUTH_USER` और `BASIC_AUTH_PASS` से सुरक्षित है, तो इंटीग्रेशन लॉग इन नहीं कर पाता। तब यह सिर्फ़ उसी मशीन से काम करता है, या उस डिवाइस से जो `IP_ALLOWLIST` में दर्ज है।

ये सेटिंग्स कैसे काम करती हैं और कौन सी चुननी चाहिए, यह [रिमोट एक्सेस: Basic Auth और IP अलाउलिस्ट](../REMOTE_ACCESS.md) में देखें।

## Home Assistant में इंटीग्रेशन इंस्टॉल करें

इंस्टॉल दो चरणों में होता है। पहले इसे HACS में जोड़ें, फिर सेट करें।

### HACS में जोड़ें

1. Home Assistant में **HACS** खोलें।
2. तीन बिंदु वाला मेन्यू खोलें, फिर **Custom repositories** पर क्लिक करें।
3. रिपॉज़िटरी वाले बॉक्स में यह पता डालें:

```
https://github.com/Pasta-Devs/Marinara-Engine
```

4. कैटेगरी **Integration** पर सेट करें, फिर **Add** पर क्लिक करें।
5. **Marinara Engine** सर्च करें, फिर इसे इंस्टॉल करें।
6. Home Assistant दोबारा शुरू करें।

### सेट करें

1. **Settings** (सेटिंग्स) में जाएँ, फिर **Devices & Services**, फिर **Add Integration** पर क्लिक करें।
2. **Marinara Engine** सर्च करें।
3. **Host** और **Port** में वह पता डालें जहाँ Marinara चल रहा है। डिफ़ॉल्ट `localhost` और `7860` हैं।
4. **Submit** पर क्लिक करें।

अगर उस पते पर Marinara तक पहुँच नहीं बनती, तो Home Assistant एरर दिखाता है और सेटअप पूरा नहीं होता। नीचे ट्रबलशूटिंग देखें।

## Marinara Engine अपने आप क्या बनाता है

सेटअप सफल होते ही इंटीग्रेशन सब कुछ खुद तैयार कर देता है।

- यह Home Assistant के अंदर एक निजी वेबहुक रजिस्टर करता है।
- यह Marinara के **Functions** सेक्शन में स्मार्ट होम टूल बनाता है, और हर टूल पहले से उसी वेबहुक की तरफ़ इशारा करता है।
- यह Marinara में **Home Assistant** एजेंट बनाता है, जिसमें हर चालू टूल दर्ज होता है।
- यह Home Assistant की वे एंटिटी बनाता है जिनका ज़िक्र इस गाइड में आगे है।

## Home Assistant एजेंट को चैट में जोड़ें

एजेंट बन जाने भर से वह हर चैट में नहीं लगता। जिस चैट में स्मार्ट होम कंट्रोल चाहिए, उसमें इसे अलग से जोड़ना होगा।

1. जो चैट चाहिए उसे खोलें।
2. **Chat Settings** (चैट सेटिंग्स) खोलें, फिर **Agents** (एजेंट) सेक्शन।
3. चैट में **Home Assistant** एजेंट जोड़ें।

Home Assistant एजेंट Roleplay, Conversation और Game चैट में चलता है। जुड़ते ही उस चैट में स्मार्ट होम टूल AI के लिए अपने आप उपलब्ध हो जाते हैं। चैट में और कुछ चालू करने की ज़रूरत नहीं।

## जाँचें कि सेटअप काम कर रहा है

एक आसान रिक्वेस्ट से कनेक्शन परखें।

1. ऊपर बताए तरीके से किसी चैट में **Home Assistant** एजेंट जोड़ें।
2. उसी चैट में सादी भाषा में कुछ लिखें, जैसे: `Turn on the office lights`।
3. संदेश भेजें।

AI को कोई स्मार्ट होम टूल कॉल करना चाहिए, जैसे `ha_turn_on`, और उससे जुड़ी लाइट जल जानी चाहिए। इसके बाद AI बता देता है कि उसने क्या किया। अगर कुछ नहीं होता, तो जाँच लें कि `WEBHOOK_LOCAL_URLS_ENABLED=true` सेट है, और ट्रबलशूटिंग देखें।

## टूल की उपलब्ध कैटेगरी

इंटीग्रेशन अपने स्मार्ट होम टूल को आठ कैटेगरी में बाँटता है। Marinara किन कैटेगरी को इस्तेमाल कर सकता है, यह आप तय करते हैं।

कैटेगरी बदलने के लिए **Settings** खोलें, फिर **Devices & Services**, फिर **Marinara Engine** पर क्लिक करें और उसके बाद **Configure** पर। यहाँ दो विकल्प मिलते हैं:

- **Primary Chat**: वह डिफ़ॉल्ट चैट जिस पर Home Assistant की सर्विस काम करती हैं। इन सर्विस के बारे में इसी गाइड में आगे बताया गया है।
- **Exposed Tool Categories**: टूल की उन कैटेगरी की लिस्ट जिन्हें Marinara इस्तेमाल कर सकता है।

इस तालिका में हर कैटेगरी, उसकी डिफ़ॉल्ट हालत और उसमें शामिल टूल दिए गए हैं।

| कैटेगरी | डिफ़ॉल्ट | टूल |
|---|---|---|
| Lights & Switches | On | ha_turn_on, ha_turn_off, ha_toggle, ha_set_brightness, ha_set_color, ha_set_color_temp |
| Climate | On | ha_set_temperature, ha_set_hvac_mode |
| Covers (Blinds & Garage) | On | ha_open_cover, ha_close_cover, ha_set_cover_position |
| Locks | Off | ha_lock, ha_unlock |
| Media Players | On | ha_media_play, ha_media_pause, ha_set_volume |
| Scenes & Scripts | On | ha_activate_scene, ha_run_script |
| Query | On | ha_get_state, ha_list_areas, ha_list_entities, ha_notify |
| Generic Service Calls (Advanced) | Off | ha_call_service |

**Locks** और **Generic Service Calls (Advanced)**, दोनों डिफ़ॉल्ट रूप से बंद रहती हैं। इन्हें तभी चालू करें जब सचमुच ज़रूरत हो। **Generic Service Calls (Advanced)** से AI कोई भी Home Assistant सर्विस कॉल कर सकता है, इसलिए इसे सोच-समझकर चालू करें।

ज़्यादातर टूल या तो कोई एक खास डिवाइस लेते हैं या कमरे का नाम। कमरे का नाम देने पर टूल उस कमरे के हर मिलते-जुलते डिवाइस पर एक साथ काम करता है।

कैटेगरी में किया गया बदलाव तभी लागू होता है जब आप **Marinara Sync HA Tools** दबाएँ या Home Assistant दोबारा शुरू करें। इस बटन के बारे में अगले सेक्शन में बताया गया है।

## Home Assistant की एंटिटी

इंटीग्रेशन ये एंटिटी **Marinara Engine** नाम के Home Assistant डिवाइस के नीचे बनाता है।

| एंटिटी | प्रकार | क्या करती है |
|---|---|---|
| Marinara Chat Count | Sensor | Marinara की कुल चैट की संख्या दिखाती है |
| Marinara Active Agent Count | Sensor | Marinara के कितने एजेंट चालू हैं, यह दिखाती है |
| Marinara Active Chat | Select | तय करती है कि Home Assistant की सर्विस किस चैट पर काम करेंगी |
| Marinara Agent: (name) | Switch | Marinara का कोई एक एजेंट चालू या बंद करती है। हर एजेंट के लिए एक स्विच होता है |
| Marinara Abort Generation | Button | जो भी AI जवाब बन रहा हो, उसे रोक देता है |
| Marinara Sync HA Tools | Button | सारे टूल दोबारा भेजता है और Home Assistant एजेंट फिर से बनाता है |

इंटीग्रेशन हर 30 सेकंड में Marinara से नई चैट और एजेंट की जानकारी लेता है। Marinara में अभी-अभी बनाई गई चैट या एजेंट को यहाँ दिखने में 30 सेकंड तक लग सकते हैं।

## Home Assistant के ऑटोमेशन से Marinara चलाएँ

इंटीग्रेशन Home Assistant में दो सर्विस जोड़ता है। इन्हें Home Assistant के ऑटोमेशन में इस्तेमाल किया जाता है, Marinara के अंदर नहीं। दोनों डिफ़ॉल्ट रूप से आपकी **Primary Chat** पर काम कर सकती हैं।

### संदेश भेजना (marinara_engine.send_message)

यह किसी Marinara चैट में संदेश भेजती है।

- `message`: संदेश का टेक्स्ट। यह फ़ील्ड ज़रूरी है।
- `chat_id`: संदेश किस चैट में जाएगा। खाली छोड़ने पर Primary Chat इस्तेमाल होती है।
- `role`: संदेश किसकी तरफ़ से है। यह `user`, `assistant`, `system` या `narrator` हो सकता है। डिफ़ॉल्ट `user` है।
- `trigger_generation`: true होने पर संदेश भेजे जाने के बाद AI जवाब भी देता है। डिफ़ॉल्ट false है।

यह रहा एक ऑटोमेशन, जो सामने का दरवाज़ा खुलने पर AI को बता देता है:

```yaml
automation:
  trigger:
    platform: state
    entity_id: binary_sensor.front_door
    to: "on"
  action:
    service: marinara_engine.send_message
    data:
      message: "Someone just arrived at the front door."
      trigger_generation: true
```

### जेनरेशन ट्रिगर करना (marinara_engine.trigger_generation)

यह चैट में AI का जवाब शुरू कर देती है, बिना आपकी तरफ़ से कोई दिखने वाला संदेश भेजे।

- `chat_id`: कौन सी चैट इस्तेमाल होगी। खाली छोड़ने पर Primary Chat इस्तेमाल होती है।
- `user_message`: जवाब वाले टर्न के साथ भेजा जाने वाला वैकल्पिक संदेश।

## सेटिंग्स बदलने के बाद दोबारा सिंक करना

चालू कैटेगरी बदलने के बाद बदलाव लागू करने के लिए **Marinara Sync HA Tools** दबाएँ। यह बटन Home Assistant में **Marinara Engine** डिवाइस के पेज पर मिलता है।

**Marinara Sync HA Tools** दबाने पर यह होता है:

- मौजूदा टूल वहीं के वहीं अपडेट हो जाते हैं, ताकि हर बदलाव Marinara तक पहुँचे।
- अगर आपने Marinara में **Home Assistant** एजेंट मिटा दिया हो, तो वह दोबारा बन जाता है।
- जिस टूल की कैटेगरी आपने बंद की है, वह टूल बंद हो जाता है। ऐसे टूल मिटते नहीं हैं।

Marinara के अंदर Home Assistant वाले टूल हाथ से न बदलें। अगली सिंक आपके बदलाव मिटा देती है और टूल दोबारा चालू कर देती है।

## समस्या-समाधान

### सेटअप फ़ॉर्म कहता है कि कनेक्ट नहीं हो पा रहा

जाँच लें कि Marinara Engine चल रहा है। यह भी देखें कि आपने जो **Host** और **Port** डाले हैं, वे उसी पते से मिलते हैं जहाँ यह सुन रहा है। डिफ़ॉल्ट `localhost` और `7860` हैं।

अगर Home Assistant, Marinara से अलग डिवाइस पर चलता है, तो Marinara उसे डिफ़ॉल्ट रूप से रोक देता है। इंटीग्रेशन पासवर्ड भेज नहीं सकता, इसलिए Marinara को उस डिवाइस को बिना पासवर्ड स्वीकार करना होगा। Home Assistant डिवाइस का IP पता Marinara की `.env` फ़ाइल के `IP_ALLOWLIST` में जोड़ें। यह और बाकी विकल्प [रिमोट एक्सेस: Basic Auth और IP अलाउलिस्ट](../REMOTE_ACCESS.md) में देखें। `BASIC_AUTH_USER` और `BASIC_AUTH_PASS` से सुरक्षित Marinara भी इंटीग्रेशन को ठुकरा देता है, बशर्ते वह डिवाइस `IP_ALLOWLIST` में दर्ज न हो।

ये नियम सेटअप के बाद भी लागू रहते हैं। अगर Marinara बाद में Home Assistant डिवाइस को रोक दे, तो सेंसर और चैट की लिस्ट चुपचाप अपडेट होना बंद कर देते हैं।

### AI कोई डिवाइस टूल चलाता है, पर कुछ होता नहीं

सबसे बड़ी संभावना यही है कि वेबहुक कॉल रुक रही है। Marinara की `.env` फ़ाइल में `WEBHOOK_LOCAL_URLS_ENABLED=true` जोड़ें और सेव करें। यह कुछ ही सेकंड में लागू हो जाता है। इसके बिना टूल कॉल फ़ेल हो सकती है, और `http` की मनाही या प्राइवेट पता ठुकराए जाने का संदेश आता है।

अगर Marinara और Home Assistant एक ही मशीन पर चलते हैं, तो इंटीग्रेशन वेबहुक के लिए इंटरनल पता अपने आप इस्तेमाल कर लेता है। अगर Marinara किसी दूसरे डिवाइस पर चलता है, तो जाँच लें कि उस डिवाइस से Home Assistant के लोकल नेटवर्क पते तक पहुँच बनती है।

### टूल Functions की लिस्ट में दिखते ही नहीं

**Marinara Sync HA Tools** दबाएँ, या Home Assistant दोबारा शुरू करें। इसके बाद Marinara में Presets पैनल का **Functions** सेक्शन देखें।

### Home Assistant एजेंट मेरी चैट में है ही नहीं

पहले पक्का करें कि Marinara में Agents के नीचे **Home Assistant** एजेंट मौजूद है। अगर नहीं है, तो उसे दोबारा बनाने के लिए **Marinara Sync HA Tools** दबाएँ। फिर **Chat Settings** खोलें, **Agents** सेक्शन खोलें और उस चैट में **Home Assistant** एजेंट जोड़ें।

### वेबहुक का पता हाथ से ढूँढना

इसकी ज़रूरत कभी-कभार ही पड़ती है, क्योंकि हर टूल में पता पहले से सेट रहता है। इसे देखने के लिए Home Assistant में **Settings** खोलें, फिर **Devices & Services**, फिर **Marinara Engine**। वेबहुक इस पैटर्न का होता है, जिसमें 8123 Home Assistant का डिफ़ॉल्ट पोर्ट है:

```
http://<homeassistant-ip>:8123/api/webhook/<webhook-id>
```

## अनइंस्टॉल करना

इंटीग्रेशन हटाने के लिए Home Assistant में **Settings** खोलें, फिर **Devices & Services**, फिर **Marinara Engine**, और वहीं से इसे मिटा दें। इससे Home Assistant की एंटिटी हट जाती हैं। Marinara के **Functions** सेक्शन में इसने जो टूल बनाए थे, वे Marinara में बने रहते हैं। **Home Assistant** एजेंट भी बना रहता है। अगर अब इनकी ज़रूरत न हो, तो दोनों को Marinara में हाथ से मिटाएँ।

## मिलती-जुलती गाइड

- [कस्टम टूल](../extending/custom-tools.md)
- [एजेंट: आपकी चैट में मदद करने वाले AI](../agents/agents-overview.md)
- [सर्वर कॉन्फ़िगरेशन रेफ़रेंस](../CONFIGURATION.md)
- [रिमोट एक्सेस: Basic Auth और IP अलाउलिस्ट](../REMOTE_ACCESS.md)
