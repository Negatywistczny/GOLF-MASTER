const WS_URL = "ws://localhost:8765";

const canDictionary = {
    "0x151": { name: "AIRBAG (mAirbag_1)", zone: "system" },
    "0x291": { name: "ZAMEK / KOMFORT (mZKE_1)", zone: "komfort" },
    "0x2C1": { name: "MANETKI (mLSM_1)", zone: "komfort" },
    "0x2C3": { name: "STACYJKA (mZAS_Status)", zone: "naped" },
    "0x351": { name: "GATEWAY (mGateway_1)", zone: "system" },
    "0x359": { name: "HAMULCE / BIEGI (mGW_Bremse)", zone: "naped" },
    "0x35B": { name: "SILNIK (mGW_Motor)", zone: "naped" },
    "0x3C3": { name: "KĄT SKRĘTU (mLenkwinkel)", zone: "naped" },
    "0x3E1": { name: "CLIMATRONIC 1 (mClima_1)", zone: "komfort" },
    "0x3E3": { name: "CLIMATRONIC 2 (mClima_2)", zone: "komfort" },
    "0x42B": { name: "SLEEP / WAKE (mNM_Gateway)", zone: "system" },
    "0x470": { name: "DRZWI / ŚWIATŁA (mBSG_Kombi)", zone: "komfort" },
    "0x527": { name: "TEMP. ZEWN. (mGW_Kombi)", zone: "media" },
    "0x555": { name: "TURBO / OLEJ (mMotor7)", zone: "naped" },
    "0x557": { name: "BŁĘDY MODUŁÓW (mKD_Error)", zone: "system" },
    "0x571": { name: "ZASILANIE / AKU (mBSG_2)", zone: "naped" },
    "0x575": { name: "STATUS ŚWIATEŁ (mBSG_3)", zone: "komfort" },
    "0x60E": { name: "JEDNOSTKI (mEinheiten)", zone: "media" },
    "0x621": { name: "PALIWO / RĘCZNY (mKombi_K1)", zone: "naped" },
    "0x62F": { name: "WYŚWIETLACZ MFA (mDisplay_1)", zone: "media" },
    "0x635": { name: "ŚCIEMNIANIE DESKI (mDimmung)", zone: "komfort" },
    "0x651": { name: "FLAGI SYSTEMU (mSysteminfo)", zone: "system" },
    "0x653": { name: "REGION / JĘZYK (mGateway_3)", zone: "media" },
    "0x655": { name: "LISTA MODUŁÓW (mVerbauliste)", zone: "system" },
    "0x65D": { name: "CZAS / PRZEBIEG (mDiagnose_1)", zone: "media" },
    "0x65F": { name: "VIN POJAZDU (mFzg_Ident)", zone: "system" }
};


export { WS_URL, canDictionary };
