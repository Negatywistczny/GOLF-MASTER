// Wyjatki wzgledem klasyfikacji domyslnej z signalMeta.states.
const FRAME_SIGNAL_COLOR_OVERRIDES = Object.freeze({
    "0x151": {
        "AB1_AirbagLampe_ein": {
            "0": "info",
            "1": "info"
        },
        "AB1_BF_Anschnall": {
            "1": "error"
        },
        "AB1_Beif_Airbag_deaktiviert": {
            "1": "info"
        },
        "AB1_CrashStaerke": {
            "3": "enabled"
        },
        "AB1_Systemfehler": {
            "0": "enabled"
        }
    },
    "0x291": {
        "ZK1_BT_entriegeln": {
            "1": "enabled"
        },
        "ZK1_BT_verriegeln": {
            "1": "enabled"
        },
        "ZK1_FT_entriegeln": {
            "1": "enabled"
        },
        "ZK1_FT_verriegeln": {
            "1": "enabled"
        },
        "ZK1_HD_entriegeln": {
            "1": "enabled"
        },
        "ZK1_HD_verriegeln": {
            "1": "enabled"
        },
        "ZK1_HL_entriegeln": {
            "1": "enabled"
        },
        "ZK1_HL_verriegeln": {
            "1": "enabled"
        },
        "ZK1_HR_entriegeln": {
            "1": "enabled"
        },
        "ZK1_HR_verriegeln": {
            "1": "enabled"
        },
        "ZK1_LED_Steuerung": {
            "0": "info"
        },
        "ZK1_Taste_Auf": {
            "0": "info"
        },
        "ZK1_Taste_HDF": {
            "0": "info"
        },
        "ZK1_Taste_Panik": {
            "0": "info"
        },
        "ZK1_Taste_Zu": {
            "0": "info"
        }
    },
    "0x2C1": {
        "LS1_BC_Down_Cursor": {
            "0": "info"
        },
        "LS1_BC_Reset": {
            "0": "info"
        },
        "LS1_BC_Up_Cursor": {
            "0": "info"
        },
        "LS1_Bew_Frontwaschen": {
            "1": "info"
        },
        "LS1_Blk_links": {
            "0": "info",
            "1": "info"
        },
        "LS1_Blk_rechts": {
            "0": "info",
            "1": "info"
        },
        "LS1_ELV_enable": {
            "0": "enabled",
            "1": "enabled"
        },
        "LS1_Easy_Entry_LS": {
            "0": "info"
        },
        "LS1_FAS_Taster": {
            "0": "info"
        },
        "LS1_Fehler_FAS_Taster": {
            "0": "enabled"
        },
        "LS1_Fehler_Vibration": {
            "0": "enabled"
        },
        "LS1_Fernlicht": {
            "0": "info",
            "1": "info"
        },
        "LS1_Frontwaschen": {
            "0": "info",
            "1": "info"
        },
        "LS1_Heckintervall": {
            "0": "info",
            "1": "info"
        },
        "LS1_Heckwaschen": {
            "0": "info",
            "1": "info"
        },
        "LS1_Intervall": {
            "0": "info",
            "1": "info"
        },
        "LS1_LHeizung_aktiv": {
            "0": "info",
            "1": "info"
        },
        "LS1_LSY_oben": {
            "0": "info"
        },
        "LS1_LSY_unten": {
            "0": "info"
        },
        "LS1_LSZ_vor": {
            "0": "info"
        },
        "LS1_LSZ_zurueck": {
            "0": "info"
        },
        "LS1_MFA_vorhanden": {
            "1": "info"
        },
        "LS1_MFL_vorhanden": {
            "1": "info"
        },
        "LS1_P_verriegelt": {
            "0": "enabled"
        },
        "LS1_Parklicht_links": {
            "0": "info",
            "1": "info"
        },
        "LS1_Parklicht_rechts": {
            "0": "info",
            "1": "info"
        },
        "LS1_Servicestellung": {
            "0": "info"
        },
        "LS1_Winterstellung": {
            "0": "info"
        },
        "LS1_WischenStufe_1": {
            "0": "info",
            "1": "info"
        },
        "LS1_WischenStufe_2": {
            "0": "info",
            "1": "info"
        },
        "LS1_def_ELV_Enable": {
            "0": "enabled"
        },
        "LS1_def_P_Verriegelt": {
            "0": "enabled"
        }
    },
    "0x2C3": {
        "ZS1_ZAS_Kl_15": {
            "0": "info",
            "1": "info"
        },
        "ZS1_ZAS_Kl_50": {
            "0": "info"
        },
        "ZS1_ZAS_Kl_P": {
            "0": "info",
            "1": "info"
        },
        "ZS1_ZAS_Kl_S": {
            "1": "info"
        }
    },
    "0x351": {
        "GW1_FzgGeschw": {
            "32725": "error",
            "32742": "error"
        }
    },
    "0x359": {
        "GWB_Info_Waehlhebel": {
            "15": "error"
        }
    },
    "0x35B": {
        "GWM_Anl_Ausspuren": {
            "0": "enabled"
        },
        "GWM_Bremslicht_Schalter": {
            "0": "info"
        },
        "GWM_Bremstest_Schalter": {
            "0": "info"
        },
        "GWM_Fehl_KmittelTemp": {
            "0": "enabled"
        },
        "GWM_Freig_Bremsanforderung": {
            "1": "info"
        },
        "GWM_GRA_Status": {
            "0": "info"
        },
        "GWM_Heissl_Vorwarn": {
            "0": "enabled"
        },
        "GWM_KLuefter": {
            "0": "info"
        },
        "GWM_Klimaabschaltung": {
            "1": "info"
        },
        "GWM_Kuppl_Schalter": {
            "0": "info",
            "1": "info"
        },
        "GWM_Ueberl_KV": {
            "1": "info"
        },
        "GWM_Vorgluehen": {
            "0": "info",
            "1": "info"
        }
    },
    "0x3C3": {
        "LW1_ID": {
            "128": "enabled"
        },
        "LW1_Int_Status": {
            "0": "enabled"
        },
        "LW1_KL30_Ausfall": {
            "0": "enabled"
        }
    },
    "0x3E1": {
        "CL1_AC_Schalter": {
            "0": "info",
            "1": "info"
        },
        "CL1_HzgFrontscheibe": {
            "0": "info",
            "1": "info"
        },
        "CL1_HzgHeckscheibe": {
            "0": "info",
            "1": "info"
        },
        "CL1_Kompressor": {
            "1": "info"
        },
        "CL1_WAPU_Zuschaltung": {
            "0": "info",
            "1": "info"
        },
        "CL1_Zuheizer": {
            "0": "info",
            "1": "info"
        }
    },
    "0x3E3": {
        "CL2_SH": {
            "0": "info",
            "1": "info"
        },
        "CL2_SL_LED": {
            "0": "info",
            "1": "info"
        },
        "CL2_StSt_Info": {
            "0": "info"
        },
        "CL2_Umluft_Taste": {
            "0": "info"
        }
    },
    "0x42B": {
        "NMGW_I_SleepAck": {
            "1": "info"
        }
    },
    "0x470": {
        "BSK_AFL_defekt": {
            "0": "enabled"
        },
        "BSK_Abblendlicht": {
            "0": "info",
            "1": "info"
        },
        "BSK_Anhaenger": {
            "0": "info",
            "1": "info"
        },
        "BSK_BSG_defekt": {
            "0": "enabled"
        },
        "BSK_Blk_links": {
            "0": "info",
            "1": "info"
        },
        "BSK_Blk_rechts": {
            "0": "info",
            "1": "info"
        },
        "BSK_DWA_Akku": {
            "0": "enabled"
        },
        "BSK_Def_Lampe": {
            "0": "enabled",
            "1": "info"
        },
        "BSK_Display_def": {
            "0": "enabled"
        },
        "BSK_FFB_Bat": {
            "0": "enabled"
        },
        "BSK_FLA_Defekt": {
            "0": "enabled"
        },
        "BSK_FLA_Sensor_blockiert": {
            "0": "enabled",
            "1": "info"
        },
        "BSK_Fernlicht": {
            "0": "info",
            "1": "info"
        },
        "BSK_Heckscheibenhzg": {
            "0": "info",
            "1": "info"
        },
        "BSK_Interlock": {
            "0": "info",
            "1": "info"
        },
        "BSK_Klemme_58t_def": {
            "0": "enabled"
        },
        "BSK_Ladekontrollampe": {
            "0": "enabled"
        },
        "BSK_Nebellicht": {
            "0": "info",
            "1": "info"
        },
        "BSK_Nebelschlusslicht": {
            "0": "info",
            "1": "info"
        },
        "BSK_Parklicht_links": {
            "0": "info",
            "1": "info"
        },
        "BSK_Parklicht_rechts": {
            "0": "info",
            "1": "info"
        },
        "BSK_Rueckfahrlicht": {
            "0": "info",
            "1": "info"
        },
        "BSK_Ruecks_HL_verriegelt": {
            "0": "enabled",
            "1": "enabled"
        },
        "BSK_Ruecks_HR_verriegelt": {
            "0": "enabled",
            "1": "enabled"
        },
        "BSK_Standlicht": {
            "0": "info",
            "1": "info"
        },
        "BSK_Tagfahrlicht": {
            "0": "info",
            "1": "info"
        },
        "BSK_Unterspannung": {
            "0": "enabled",
            "1": "error"
        },
        "BSK_Warnblinker": {
            "0": "info",
            "1": "info"
        }
    },
    "0x527": {
        "GWK_AussenTemp_Fehler": {
            "0": "enabled"
        },
        "KB1_Lenkh_Lampe": {
            "0": "info",
            "1": "info"
        }
    },
    "0x555": {
        "MO7_Ein_Generator": {
            "0": "info",
            "1": "info"
        },
        "MO7_Fehler_Oel_Temp": {
            "0": "enabled"
        },
        "MO7_Sleep_Ind": {
            "1": "enabled"
        }
    },
    "0x557": {
        "EKD_ADR_getrennt": {
            "0": "info",
            "1": "info"
        }
    },
    "0x571": {
        "BS2_Mess_Start_Ltg": {
            "0": "info",
            "1": "enabled"
        },
        "BS2_Weckursache_ACAN": {
            "2": "info"
        },
        "BS2_Zust_Start_Ltg": {
            "1": "error"
        },
        "BS2_aus_PTC_Clima": {
            "100": "info"
        }
    },
    "0x575": {
        "BS3_Ab_Batterie": {
            "0": "info",
            "1": "info"
        },
        "BS3_Bordnetzbatt": {
            "0": "enabled",
            "1": "error"
        },
        "BS3_IRUE_Taster": {
            "0": "info"
        },
        "BS3_Klemme_15": {
            "0": "info",
            "1": "info"
        },
        "BS3_Klemme_15_Motorraum": {
            "0": "info",
            "1": "info"
        },
        "BS3_Klemme_50": {
            "0": "info",
            "1": "info"
        },
        "BS3_Klemme_P": {
            "0": "info",
            "1": "info"
        },
        "BS3_Klemme_S": {
            "1": "info"
        },
        "BS3_Klemme_X": {
            "0": "info",
            "1": "info"
        },
        "BS3_LED_Aussenspiegel": {
            "0": "info",
            "1": "info"
        },
        "BS3_LED_Frontscheibe": {
            "0": "info",
            "1": "info"
        },
        "BS3_LED_Heckscheibe": {
            "0": "info",
            "1": "info"
        },
        "BS3_LED_Sitze": {
            "0": "info",
            "1": "info"
        },
        "BS3_LWR_Fehler": {
            "0": "enabled"
        },
        "BS3_Ladekontrollampe": {
            "0": "info",
            "1": "info"
        },
        "BS3_PDC_Taster": {
            "0": "info"
        },
        "BS3_Starterbatt": {
            "0": "enabled",
            "1": "error"
        },
        "BS3_VP_Taste": {
            "0": "info"
        }
    },
    "0x60E": {
        "EH1_Einh_Vol": {
            "1": "info"
        },
        "EH1_Verstellung_Strck": {
            "0": "enabled"
        },
        "EH1_Wochentag": {
            "1": "info"
        }
    },
    "0x621": {
        "KO1_Fernlicht": {
            "0": "info",
            "1": "info"
        },
        "KO1_Freigabe_Zuheizer": {
            "0": "info",
            "1": "info"
        },
        "KO1_Handbremse": {
            "0": "info"
        },
        "KO1_Klemme_L": {
            "0": "info",
            "1": "info"
        },
        "KO1_MFA_vorhanden": {
            "1": "info"
        },
        "KO1_Sta_Displ": {
            "0": "enabled"
        },
        "KO1_Tankwarnlampe": {
            "0": "info",
            "1": "info"
        },
        "KO1_Tankwarnung": {
            "0": "enabled"
        },
        "KO1_WaschWasser": {
            "0": "enabled"
        }
    },
    "0x62F": {
        "DY1_Display_OK": {
            "1": "enabled"
        },
        "DY1_MFA_Down": {
            "0": "info"
        },
        "DY1_MFA_Reset": {
            "0": "info"
        },
        "DY1_MFA_Up": {
            "0": "info"
        }
    },
    "0x635": {
        "DI1_Display_def": {
            "0": "enabled"
        },
        "DI1_Schalter_def": {
            "0": "enabled"
        }
    },
    "0x651": {
        "SY1_CAN_Extern": {
            "0": "info",
            "1": "info"
        },
        "SY1_Diag_Antrieb": {
            "1": "enabled"
        },
        "SY1_Diag_Infotainment": {
            "1": "enabled"
        },
        "SY1_Diag_Komfort": {
            "1": "enabled"
        },
        "SY1_ELV_Lock_Supply": {
            "0": "enabled",
            "1": "enabled"
        },
        "SY1_Erweiterung": {
            "8": "enabled"
        },
        "SY1_Infotainment": {
            "0": "info"
        },
        "SY1_NWDF": {
            "0": "enabled"
        },
        "SY1_Notbrems_Status": {
            "1": "error"
        },
        "SY1_QRS_Messmodus": {
            "0": "info",
            "1": "info"
        },
        "SY1_Rechtslenker": {
            "0": "info",
            "1": "info"
        },
        "SY1_Relais_FAS_Zweig": {
            "0": "enabled"
        },
        "SY1_Sleep_Infotainment": {
            "1": "info"
        },
        "SY1_Sleep_Komfort": {
            "1": "info"
        }
    },
    "0x653": {
        "GW3_Laendervariante": {
            "5": "info"
        },
        "GW3_Sprachvariante": {
            "12": "info"
        }
    },
    "0x655": {
        "VBN_ADR_getrennt": {
            "0": "info",
            "1": "info"
        },
        "VBN_Soll_Ist_OK": {
            "0": "info"
        }
    }
});

export { FRAME_SIGNAL_COLOR_OVERRIDES };
