# Noodle प्रॉम्प्ट इंटरनल्स (डेवलपर्स)

डेवलपर रेफ़रेंस: Noodle के जेनरेशन प्रॉम्प्ट कोड में कहाँ रहते हैं, उन्हें कैसे बदला जाता है, और फ़ाइनल प्रॉम्प्ट को कैसे डीबग करें। रोज़ाना इस्तेमाल के लिए Noodle को उसके **Settings** (सेटिंग्स) पैनल से सेट किया जाता है; इसकी गाइड `docs/noodle/` में हैं।

## प्रॉम्प्ट का सोर्स मैप

Noodle में फ़िलहाल एक इनलाइन टेक्स्ट-जेनरेशन प्रॉम्प्ट, एक रजिस्टर किया हुआ टेक्स्ट प्रॉम्प्ट ओवरराइड और एक रजिस्टर किया हुआ इमेज प्रॉम्प्ट ओवरराइड है।

| मकसद | सोर्स | मुख्य सिंबल | कैसे बदलें |
| --- | --- | --- | --- |
| टाइमलाइन पोस्ट, रिप्लाई, फ़ॉलो, पोल, वोट और डाइजेस्ट | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` | कोड में इनलाइन सिस्टम और कॉन्टेक्स्ट संदेश बदलें। टोन और क्रिएटिव आज़ादी वाला हिस्सा नीचे दिए **Noodle Timeline Voice & Tone** ओवरराइड के हवाले है; बाकी हिस्सा, यानी स्कीमा के लिए ज़रूरी आउटपुट-फ़ॉर्मैट नियम, UI से नहीं बदले जा सकते। |
| टाइमलाइन के वॉइस/टोन निर्देश (सिस्टम प्रॉम्प्ट का एक हिस्सा) | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_TIMELINE_VOICE` (`noodle.timelineVoice`) | **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Timeline Voice & Tone** में बदलाव करें, या कोड में रजिस्टर किया हुआ डिफ़ॉल्ट (`noodle-prompt.ts` में `noodleTimelineVoiceDefaultText(enhanced)`) बदलें। इसका दायरा जानबूझकर सिर्फ़ टोन तक रखा गया है। स्ट्रक्चर्ड-एक्शन की सीमाएँ, टारगेट फ़ील्ड के नियम और स्कीमा के लिए ज़रूरी बाकी निर्देश इस ओवरराइड से बाहर हार्डकोड रहते हैं, ताकि दोबारा लिखने पर `noodleGeneratedRefreshSchema` की पार्सिंग न टूटे। बिना बदला हुआ डिफ़ॉल्ट Noodle सेटिंग `enableEnhancedTimelineWriting` (`ctx.enhanced`, डिफ़ॉल्ट रूप से बंद, जिसमें वही पुराना एक-पंक्ति वाला टोन निर्देश मिलता है) के मुताबिक चलता है; अपना ओवरराइड टेक्स्ट सेव करने के बाद उसी की चलती है, चाहे यह सेटिंग कुछ भी हो। |
| कैरेक्टर अकाउंट की पहली बार बनने वाली प्रोफ़ाइल | `packages/server/src/routes/noodle.routes.ts` | `generateMissingNoodleProfiles()` | कोड में इनलाइन सिस्टम और यूज़र संदेश बदलें। पहले पार्टिसिपेंट चुने जाते हैं, और इस प्रॉम्प्ट तक सिर्फ़ वही चुने हुए कैरेक्टर अकाउंट पहुँचते हैं जिनमें `profileGenerated` नहीं है। |
| जेनरेट होने वाली पोस्ट इमेज का प्रॉम्प्ट | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_IMAGE_POST` (`noodle.imagePost`) | **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Post Image** में बदलाव करें, या कोड में रजिस्टर किया हुआ डिफ़ॉल्ट बदलें। |
| Noodle के अपने डिफ़ॉल्ट इमेज निर्देश | `packages/shared/src/schemas/noodle.schema.ts` | `DEFAULT_NOODLE_SETTINGS.imageGenerationPrompt` | UI में Noodle सेटिंग बदलें, या कोड में उसका स्कीमा डिफ़ॉल्ट बदलें। |
| टाइमलाइन जेनरेशन में जोड़ा जाने वाला ऑप्ट-इन चैट कॉन्टेक्स्ट | `packages/server/src/routes/noodle.routes.ts` | `buildOptedInChatContext()` | कोड में कॉन्टेक्स्ट जोड़ने का तरीका बदलें; ऑप्ट-इन का फ़ैसला हर चैट की अपनी सेटिंग्स में ही रहता है। |
| टाइमलाइन पोस्ट और रिप्लाई के इमेज इनपुट | `packages/server/src/services/noodle/noodle-vision.ts` | `prepareNoodleVisionAttachments()` | कोड में इमेज चुनने, नॉर्मलाइज़ करने, सीमाएँ तय करने या सिर्फ़-टेक्स्ट वाले कंपैटिबिलिटी फ़ॉलबैक का तरीका बदलें। |
| चैट प्रॉम्प्ट में जोड़ी जाने वाली Noodle गतिविधि | `packages/server/src/services/noodle/noodle-context.ts` | `buildRecentSocialMediaActivityBlock()` | कोड में फ़िल्टरिंग या ब्लॉक बनाने का तरीका बदलें; टारगेट मोड और आइटम की सीमा Noodle Settings से तय होती है, जबकि पूरे ब्लॉक पर 8,192 टोकन की पक्की सीमा लगी रहती है। |
| जेनरेट होने वाला JSON कॉन्ट्रैक्ट | `packages/shared/src/schemas/noodle.schema.ts` | `noodleGeneratedRefreshSchema` | इसे सिर्फ़ प्रॉम्प्ट, रूट प्रोसेसिंग, शेयर्ड टाइप और रिग्रेशन कवरेज के साथ मिलाकर ही बदलें। |
| टाइमलाइन जेनरेशन में जोड़ा जाने वाला लोरबुक का वर्ल्ड/लोर कॉन्टेक्स्ट | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` (`processLorebooks()` को कॉल करता है) | यह **Lorebook context** नाम की Noodle सेटिंग (`enableLorebookContext`, डिफ़ॉल्ट रूप से बंद) से चलता है। यह वही मल्टी-कैरेक्टर `processLorebooks()` दोबारा इस्तेमाल करता है जो ग्रुप चैट में चलता है, पर टोकन बजट Noodle के लिए अलग से `noodle-prompt.ts` के `noodleLorebookTokenBudget()` से आता है, जो चालू कैरेक्टर की संख्या के हिसाब से बढ़ता है और 8,192 टोकन पर पक्का रुक जाता है। यह `previewOnly: true` के साथ चलता है, क्योंकि Noodle में स्टिकी/कूलडाउन टाइमिंग स्टेट सेव करने के लिए प्रति-चैट कोई स्लॉट नहीं है। |

टाइमलाइन और प्रोफ़ाइल वाले प्रॉम्प्ट फ़िलहाल Prompt Overrides UI में नहीं दिखते। वहाँ Noodle का सिर्फ़ **Noodle Post Image** टेम्पलेट मिलता है। Noodle के अपने **Prompt instructions** फ़ील्ड की सामग्री उसी इमेज टेम्पलेट में जाती है; टाइमलाइन लिखने वाले प्रॉम्प्ट पर इसका कोई असर नहीं होता।

इमेज रूट पहले `NOODLE_IMAGE_POST` लोड करता है, फिर नतीजे को `compileImagePrompt()` से गुज़ारकर इमेज प्रोवाइडर को भेजता है। यानी चुनी हुई इमेज स्टाइल प्रोफ़ाइल और कनेक्शन के डिफ़ॉल्ट भी फ़ाइनल रिक्वेस्ट पर असर डाल सकते हैं।

## फ़ाइनल प्रॉम्प्ट की जाँच

Debug Mode चालू रखकर मैन्युअल रिफ़्रेश करने पर प्रोफ़ाइल और टाइमलाइन के फ़ाइनल मॉडल संदेश शेयर्ड सर्वर लॉगर में दर्ज हो जाते हैं। इन्हें देखें:

```text
[debug/noodle] Profile prompt sent to model
[debug/noodle] Prompt sent to model
[debug/noodle] Attached N timeline image input(s) to the refresh prompt
```

डीबग लॉग में टाइमलाइन इमेज का पेलोड कभी base64 के रूप में नहीं लिखा जाता। लॉग किए गए टेक्स्ट में वही पोस्ट/रिप्लाई अटैचमेंट की-नाम होते हैं जो मॉडल को भेजे जाते हैं, साथ में नेटिव इमेज इनपुट की संख्या। Noodle इन इनपुट को `noodle-vision.ts` में नॉर्मलाइज़ करता है और उनकी सीमा तय करता है। अगर कोई प्रोवाइडर विज़न सामग्री साफ़ मना कर देता है, तो रूट उसे लॉग करता है और उसकी जगह तैयार किया हुआ सिर्फ़-टेक्स्ट वाला फ़ॉलबैक प्रॉम्प्ट भेजता है।

इमेज के लिए **Settings -> Generations -> Image Generation** के नीचे **Expose media prompts before sending** चालू करें। इससे रिक्वेस्ट भेजने से पहले कंपाइल हुए फ़ाइनल पॉज़िटिव और नेगेटिव प्रॉम्प्ट देखे और बदले जा सकते हैं।

## सुरक्षित तरीके से बदलाव

प्रॉम्प्ट तैयार करने वाला हिस्सा कंपैटिबिलिटी के लिहाज़ से बहुत नाज़ुक जगह है। इसमें बदलाव करते समय प्रॉम्प्ट, `noodleGeneratedRefreshSchema`, रूट प्रोसेसिंग और Noodle के mention तथा poll रिग्रेशन, इन सबको आपस में मिला हुआ रखें। कम से कम इतना चलाएँ:

```bash
pnpm check
pnpm regression:prompt
pnpm regression:noodle
```

## मिलती-जुलती गाइड

- [Noodle: ऐप के अंदर की सोशल टाइमलाइन](../noodle/overview.md)
- [Noodle की सेटिंग्स और चैट कैरीओवर](../noodle/settings.md)
- [आर्किटेक्चर मैप (डेवलपर्स के लिए)](architecture-map.md)
