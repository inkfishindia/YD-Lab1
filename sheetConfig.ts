// This file defines the static structure of the Google Sheets used by the application.
// While some configuration is loaded dynamically, this provides the base schemas and groupings.

import { z } from 'zod';
import * as schemas from './schemas';
import type { SpreadsheetIds } from './contexts/SpreadsheetConfigContext';
import type { SheetConfig } from './services/googleSheetService';
import { appStructure } from './config/appStructure';

// Helper to normalize strings for comparison
const normalizeString = (str: string) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');

interface CsvColumnInfo {
  header: string;
  dataType: string; // From CSV: STRING, NUMBER, BLANK
  colIndex: number;
}

// Manually parsed CSV data. In a real application, this might be dynamically loaded and cached.
// This map allows us to look up actual column headers and their declared types from the CSV.
const csvDataBySheet: Map<string, CsvColumnInfo[]> = new Map();
const csvString = `spreadsheet_id,spreadsheet_name,sheet_name,gid,A1_Column_Range,Named_Range_Name,col_index,Column Letter,header,sample_value,Protection_Status,Data_Type,Contains_Formula,Data_Validation,Column_aliases
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,A:A,No,1,A,Icon,🟢,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,B:B,No,2,B,Picklist Title,status_values,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,C:C,No,3,C,Named Range,PICK_STATUS,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,D:D,No,4,D,Applied On (Sheet.Header),BusinessUnits.status; Products.status; Tasks.status,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,E:E,No,5,E,Notes,Generic status for records,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,F:F,No,6,F,(Col F - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,G:G,No,7,G,(Col G - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,H:H,PICK_STATUS,8,H,status_values,Draft,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,I:I,No,9,I,(Col I - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,J:J,PICK_BUILD_STATUS,10,J,build_status_values,Idea,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,K:K,No,11,K,(Col K - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,L:L,PICK_BU_TYPE,12,L,bu_type_values,D2C,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,M:M,No,13,M,(Col M - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,N:N,PICK_CHANNEL_TYPE,14,N,channel_type_values,Website,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,O:O,No,15,O,(Col O - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,P:P,PICK_SALES_MOTION,16,P,sales_motion_values,Self_Service,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,Q:Q,No,17,Q,(Col Q - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,R:R,PICK_SUPPORT_MODEL,18,R,support_model_values,Email,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,S:S,No,19,S,(Col S - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,T:T,PICK_ORDER_STATUS,20,T,order_status_values,New,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,U:U,No,21,U,(Col U - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,V:V,PICK_PAYMENT_MODE,22,V,payment_mode_values,Prepaid_Online,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,W:W,No,23,W,(Col W - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,X:X,PICK_FULFILLMENT_STATUS,24,X,fulfillment_status_values,Pending,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,Y:Y,No,25,Y,(Col Y - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,Z:Z,PICK_SHIPPING_TYPE,26,Z,shipping_type_values,Standard,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,[:[,No,27,[,(Col [ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,\\:\\,PICK_PRINT_METHOD,28,\\,print_method_values,Screen_Print,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,]:],No,29,],(Col ] - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,^:^,PICK_GARMENT_SIZE,30,^,garment_size_values,XS,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,_:_,No,31,_,(Col _ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,\`:\`,PICK_GENDER_FIT,32,\`,gender_fit_values,Unisex,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,a:a,No,33,a,(Col a - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,b:b,PICK_MATERIAL,34,b,material_values,Cotton,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,c:c,No,35,c,(Col c - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,d:d,PICK_PACKAGING_TYPE,36,d,packaging_type_values,Polybag,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,e:e,No,37,e,(Col e - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,f:f,PICK_TAX_SLAB,38,f,tax_slab_values,GST_0,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,g:g,No,39,g,(Col g - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,h:h,PICK_DISCOUNT_TYPE,40,h,discount_type_values,Flat,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,i:i,No,41,i,(Col i - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,j:j,PICK_COUPON_TYPE,42,j,coupon_type_values,Public,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,k:k,No,43,k,(Col k - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,l:l,PICK_UTM_SOURCE,44,l,utm_source_values,Direct,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,m:m,No,45,m,(Col m - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,n:n,PICK_USER_ROLE,46,n,user_role_values,Admin,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,o:o,No,47,o,(Col o - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,p:p,PICK_PARTNER_TIER,48,p,partner_tier_values,Strategic,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,q:q,No,49,q,(Col q - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,r:r,PICK_PRIORITY,50,r,priority_values,P0_Critical,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,s:s,No,51,s,(Col s - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,t:t,PICK_SEVERITY,52,t,severity_values,Sev0,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,u:u,No,53,u,(Col u - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,v:v,PICK_TASK_STATUS,54,v,task_status_values,Backlog,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,w:w,No,55,w,(Col w - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,x:x,PICK_COUNTRY,56,x,country_values,India,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,y:y,No,57,y,(Col y - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,z:z,PICK_CURRENCY,58,z,currency_values,INR,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,{:{,No,59,{,(Col { - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,|:|,PICK_BOOL,60,|,boolean_values,Yes,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,A:A,No,1,A,Metric Name,Total Segments,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,B:B,No,2,B,(Col B - Blank),5,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,C:C,No,3,C,(Col C - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,D:D,No,4,D,(Col D - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,E:E,No,5,E,(Col E - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,F:F,No,6,F,(Col F - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,G:G,No,7,G,(Col G - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,A:A,Segments_PK,1,A,segment_id,SEG-01,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,B:B,No,2,B,segment_name,D2C Lifecycle,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,C:C,No,3,C,customer_facing,YDS Direct (self-service),No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,D:D,No,4,D,Positioning,Personal expression made physical - no minimums,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,E:E,No,5,E,For,"Creators, gift-givers, event participants, social causes",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,F:F,No,6,F,Against,"Printful/Printify (foreign), local printers (minimums), Vistaprint (templates)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,G:G,No,7,G,Promise,"Your design live in 48 hours, starting at ₹399",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,H:H,No,8,H,identity,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,I:I,No,9,I,priority_rank,High,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,J:J,No,10,J,customer_profile,"Individuals, creators, small teams",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,K:K,No,11,K,psychological_job,I want to exist physically (New) → I want to reorder proven quality (Repeat),No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,L:L,No,12,L,offering_description,"Personal expression, gifting, creator merch. Single to small batch.",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,M:M,No,13,M,order_volume_range,1-100,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,N:N,No,14,N,pricing_model,markup_volume_tiers,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,O:O,No,15,O,owner_person_id,PER-04,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,P:P,No,16,P,owner_person_name,Danish Hanif,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Q:Q,Segment_Bu,17,Q,bu_id,BU-01,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,R:R,No,18,R,bu_name,Product Sales,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,S:S,No,19,S,served_by_flywheels_ids,FLW-01,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,T:T,No,20,T,Platforms,"PLT-01, PLT-03, PLT-04",No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,U:U,No,21,U,behavioral_truth,"LIFECYCLE MODEL: 3,625 New (₹12K AOV, 1x order) → 3,549 Repeat (₹15K AOV, 1.5x reorder). 36% convert New→Repeat. Acquisition expensive, retention profitable.",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,V:V,No,22,V,strategic_notes,PROFIT ENGINE IF FIXED: 30% revenue. CRITICAL DECISION: Raise minimum order ₹12K→₹500 or optimize New→Repeat 36%→60%. CAC validation urgent. Target: ₹1.5cr (+56%) only if economics fixed.,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,W:W,No,23,W,validated_aov,"₹ 13,486",No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,X:X,No,24,X,annual_orders,"8,474",No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Y:Y,No,25,Y,contribution_margin_pct,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Z:Z,No,26,Z,validated_cac,,No Protection,BLANK,No,DATE_IS_VALID_DATE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,[:[,No,27,[,annual_ltv,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,\\:\\,No,28,\\,ltv_cac_ratio,#REF!,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,]:],No,29,],validation_status,AT_RISK,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,^:^,No,30,^,(Col ^ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,_:_,No,31,_,revenue_9mo_actual_inr,9662283,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,\`:\`,No,32,\`,9mo_actual_orders,7174,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,a:a,No,33,a,growth_rate_target,56%,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,b:b,No,34,b,annual_revenue_projected_inr,12883044,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,c:c,No,35,c,(Col c - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,d:d,No,36,d,current_revenue,"9,662,283",No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,e:e,No,37,e,current_orders,7174,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,f:f,No,38,f,current_customers,4168,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,g:g,No,39,g,Current_AOV,1347,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,h:h,No,40,h,revenue_share,31.96%,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,i:i,No,41,i,avg_orders_per_customer,1.7,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,j:j,No,42,j,annual_revenue_target_inr,"15,979,125",No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,k:k,No,43,k,annual_orders_target,11864,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,l:l,No,44,l,growth_rate_needed,65.38%,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,m:m,No,45,m,(Col m - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,n:n,No,46,n,vision,Everyone can make their imagined identity physically real,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,o:o,No,47,o,mission,Remove ALL friction between imagination and physical proof,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,p:p,No,48,p,expression,I can finally be expressive and bring out my identity,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,q:q,No,49,q,messaging_tone,"Playful, experimental, identity-affirming",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,r:r,No,50,r,old_world_pain,"Tools too complex (88% abandon design), minimums block testing (₹2000+), slow (7-14 days)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,s:s,No,51,s,new_world_gain,"₹500 minimum enables experimentation, 48hr maintains momentum, tool completes designs",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,t:t,No,52,t,brand_position,Physical proof your ideas exist (starting ₹500),No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,u:u,No,53,u,competitive_alt_1,"Printful (slow, Western)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,v:v,No,54,v,competitive_alt_2,"Etsy (saturated, not manufacturing)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,w:w,No,55,w,competitive_alt_3,"Local printers (minimums, professional barrier)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,x:x,No,56,x,differentiated_value,No minimums (₹500 start) + 48hr India delivery + Identity-first design tool,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,y:y,No,57,y,market_category,Personal Expression Manufacturing,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,z:z,No,58,z,design_pov,"Identity manifestation through physical objects, reordering = self-belief reinforcement",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,{:{,No,59,{,category_entry_points,Creator merch moment | Gift personalization | Small business launch | Event merchandise | Anniversary/celebration | Identity experimentation,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,|:|,No,60,|,buying_situations,"Lifecycle Stage 1: First proof (single order, identity test) | Lifecycle Stage 2: Reorder proof (belief reinforcement, 36% convert) | Stage 3: Business conversion (1.5% become B2B)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,}:},No,61,},distinctive_assets,48-hour promise | Unboxing shareable moment | Design tool signature | ₹500 minimum (vs competitors) | India-speed positioning,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,~:~,No,62,~,(Col ~ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,63, ,(Col   - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,€:€,No,64,€,(Col € - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,65, ,(Col   - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‚:‚,No,66,‚,(Col ‚ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,ƒ:ƒ,No,67,ƒ,(Col ƒ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,„:„,No,68,„,(Col „ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,…:…,No,69,…,(Col … - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,†:†,No,70,†,(Col † - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‡:‡,No,71,‡,(Col ‡ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,ˆ:ˆ,No,72,ˆ,age group,18-40,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‰:‰,No,73,‰,(Col ‰ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Š:Š,No,74,Š,company_size,Individual/1-5 employees,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‹:‹,No,75,‹,psychographic,"Identity-driven, experimental creator, values speed + self-expression",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Œ:Œ,No,76,Œ,purchase_trigger_1,Creator wants merch,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,77, ,purchase_trigger_2,"Personal gift/event needs customization (birthday, anniversary)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Ž:Ž,No,78,Ž,purchase_trigger_3,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,79, ,current_solution_efficiency,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,80, ,our_solution_efficiency,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‘:‘,No,81,‘,delta_score,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,’:’,No,82,’,adoption_threshold,"Design tool must complete (currently 32%), price under ₹1000, delivery under 48hr",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,“:“,No,83,“,irreversibility_trigger,"Second order within 90 days (36% currently, need 60%)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,”:”,No,84,”,(Col ” - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,•:•,No,85,•,(Col • - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,–:–,No,86,–,(Col – - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,—:—,No,87,—,(Col — - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,˜:˜,No,88,˜,Claude pannel,https://claude.ai/project/0199ed77-b725-7582-ad24-0fea694c4676,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,63, ,(Col   - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,€:€,No,64,€,(Col € - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,65, ,(Col   - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‚:‚,No,66,‚,(Col ‚ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,ƒ:ƒ,No,67,ƒ,(Col ƒ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,„:„,No,68,„,(Col „ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,…:…,No,69,…,(Col … - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,†:†,No,70,†,(Col † - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‡:‡,No,71,‡,(Col ‡ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,ˆ:ˆ,No,72,ˆ,age group,18-40,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‰:‰,No,73,‰,(Col ‰ - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Š:Š,No,74,Š,company_size,Individual/1-5 employees,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‹:‹,No,75,‹,psychographic,"Identity-driven, experimental creator, values speed + self-expression",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Œ:Œ,No,76,Œ,purchase_trigger_1,Creator wants merch,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,77, ,purchase_trigger_2,"Personal gift/event needs customization (birthday, anniversary)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,Ž:Ž,No,78,Ž,purchase_trigger_3,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,79, ,current_solution_efficiency,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501, : ,No,80, ,our_solution_efficiency,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,‘:‘,No,81,‘,delta_score,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,’:’,No,82,’,adoption_threshold,"Design tool must complete (currently 32%), price under ₹1000, delivery under 48hr",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,“:“,No,83,“,irreversibility_trigger,"Second order within 90 days (36% currently, need 60%)",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,”:”,No,84,”,(Col ” - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,•:•,No,85,•,(Col • - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,–:–,No,86,–,(Col – - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,—:—,No,87,—,(Col — - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,˜:˜,No,88,˜,Claude pannel,https://claude.ai/project/0199ed77-b725-7582-ad24-0fea694c4676,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,A:A,BusinessUnits_PK,1,A,bu_id,BU-01,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,B:B,BU,2,B,bu_name,Product Sales,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,C:C,BU,3,C,bu_type,D2C,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,D:D,BU,4,D,offering_description,Product + Customisation + design tool + Customer support,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,E:E,BU,5,E,in_form_of,"Personal expression, gifting, creator merch. Single to small batch.",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,F:F,BU,6,F,order_volume_range,1-100,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,G:G,BU,7,G,sales_motion,Self-service automated,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,H:H,BU,8,H,support_model,ReActive chat,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,I:I,BU,9,I,pricing_model,markup_volume_tiers,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,J:J,BU,10,J,pricing_model_name,Per-order markup + volume tiers,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,K:K,BU,11,K,owner_person_id,PER-04,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,L:L,BU,12,L,owner_rollup_name,Danish Hanif,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,M:M,BU,13,M,serves_segments_ids,"SEG-01, SEG-02",No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,N:N,BU,14,N,primary_flywheel_id,FLW-01,No Protection,STRING,Yes,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,O:O,BU,15,O,primary_flywheel_name,Self-Service Digital,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,P:P,BU,16,P,upsell_path,BU2,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,Q:Q,BU,17,Q,monthly_capacity_orders,1076,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,R:R,BU,18,R,status,Active,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,S:S,BU,19,S,target_contribution_margin_pct,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,T:T,BU,20,T,validated_aov,1347,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,U:U,BU,21,U,9mo_actual_revenue_inr,9662283,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,V:V,BU,22,V,9mo_actual_orders,7174,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,W:W,BU,23,W,annual_revenue_target_inr,12883044,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,X:X,BU,24,X,annual_orders_target,8474,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,Y:Y,BU,25,Y,current_utilization_pct,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,Z:Z,BU,26,Z,current_revenue,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,[:[,No,27,[,current_aov,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,\\:\\,No,28,\\,current_customers,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,]:],No,29,],production_sla_hours,48,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,^:^,No,30,^,gross_margin_pct,0,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,_:_,No,31,_,variable_cost_per_order,0,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,\`:\`,No,32,\`,fixed_costs_monthly,0,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,BusinessUnits,1410852755,a:a,No,33,a,break_even_orders,0,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,A:A,Flywheels__flywheel_id,1,A,flywheel_id,FLW-01,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,B:B,FY,2,B,flywheel_name,Self-Service Digital,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,C:C,FY,3,C,customer_struggle,Need custom products fast without talking to sales,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,D:D,FY,4,D,jtbd_trigger_moment,Inspiration strikes → Need physical product now,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,E:E,FY,5,E,motion_sequence,Ad → Landing → Design Tool → Preview → Cart → Checkout → Production → Ship → Share,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,F:F,FY,6,F,serves_segments,"SEG-01, SEG-02",No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,G:G,FY,7,G,serves_bus,,No Protection,BLANK,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,H:H,FY,8,H,acquisition_channels,9,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,I:I,FY,9,I,order_size_range,₹500-₹20000,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,J:J,FY,10,J,efficiency_metrics,"CAC, Cart abandonment (96%), Tool completion rate, Reorder rate, Viral coefficient",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,K:K,FY,11,K,owner_person,PER-04,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,L:L,FY,12,L,owner_person_Name,Danish Hanif,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,M:M,FY,13,M,cac_target,₹55,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,N:N,FY,14,N,validation_status,AT_RISK,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,O:O,FY,15,O,9mo_actual_revenue_inr,10985248,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,P:P,FY,16,P,9mo_actual_orders,7671,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,Q:Q,FY,17,Q,validated_aov_inr,"₹ 1,432",No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,R:R,FY,18,R,annual_revenue_target_inr,15813664,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,S:S,FY,19,S,annual_orders_target,11028,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,T:T,FY,20,T,primary_bottleneck,Design tool abandonment + CAC profitability,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,U:U,FY,21,U,conversion_rate_pct,0.24%,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,V:V,FY,22,V,reorder_rate_6mo_pct,NEEDS_FILL,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Flywheels,294604957,W:W,FY,23,W,avg_sale_cycle_days,0-2,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,A:A,Platforms_PK,1,A,platform_id,PLT-01,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,B:B,No,2,B,platform_name,Website (YDS Direct),No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,C:C,No,3,C,platform_type,Web App,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,D:D,No,4,D,owner_hub,HUB-01,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,E:E,No,5,E,primary_segments,"SEG-01, SEG-02",No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,F:F,No,6,F,platform_icon_url,https://cdn-icons-png.flaticon.com/512/3695/3695260.png,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,G:G,No,7,G,platform_link_url,https://www.yourdesignstore.in/,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,H:H,No,8,H,tech_stack,"Next.js, Postgres",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,I:I,No,9,I,(Col I - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,J:J,No,10,J,(Col J - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,K:K,No,11,K,Current_revenue,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,L:L,No,12,L,Current_Orders,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,M:M,No,13,M,Curent_customers,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,N:N,No,14,N,Current_AOV,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,O:O,No,15,O,Revenue_share,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,P:P,No,16,P,annual_revenue_target_inr,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,Q:Q,No,17,Q,annual_orders_target,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Platforms,1976934144,R:R,No,18,R,Growth_rate_needed,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,A:A,Channels_PK,1,A,channel_id,CHL-01,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,B:B,No,2,B,channel_name,Meta Ads,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,C:C,No,3,C,channel_type,Paid,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,D:D,No,4,D,serves_primary_platform_ids,"PLT-01, PLT-02",No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,E:E,No,5,E,Platforms,#N/A,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,F:F,No,6,F,serves_bus,BU-01,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,G:G,No,7,G,serves_flywheels,FLW-01,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,H:H,No,8,H,segments_arrayed,Product + Customisation + design tool + Customer support,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,I:I,No,9,I,(Col I - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,J:J,No,10,J,Platform,"Facebook, Instagram Ads",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,K:K,No,11,K,segment_id,SEG-02,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,L:L,No,12,L,monthly_budget_inr,250000,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,M:M,No,13,M,cac_target,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,N:N,No,14,N,current_cac,945,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,O:O,No,15,O,cac_gap,,No Protection,BLANK,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,P:P,No,16,P,conversion_rate_pct,0.24%,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,Q:Q,No,17,Q,responsible_person,PER-02,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,R:R,No,18,R,responsible_person_Name,Madhu Krishna,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,S:S,No,19,S,status,Active,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,T:T,No,20,T,Monthly_Volume,1200,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,U:U,No,21,U,Annual_Revenue,2067840,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,V:V,No,22,V,Notes,CRISIS: 96% cart abandonment. Optimization priority.,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,W:W,No,23,W,LTV,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Channels,2050534733,X:X,No,24,X,ROI,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,A:A,Touchpoints_PK,1,A,touchpoint_id,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,B:B,No,2,B,touchpoint_name,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,C:C,No,3,C,stage_id,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,D:D,No,4,D,flywheel_id,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,E:E,No,5,E,customer_action,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,F:F,No,6,F,serves_segments,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,G:G,No,7,G,channel_id,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,H:H,No,8,H,interface_id,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,I:I,No,9,I,responsible_hub_id,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,J:J,No,10,J,responsible_person_id,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,K:K,No,11,K,success_metric,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,L:L,No,12,L,target_value,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,M:M,No,13,M,current_value,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,N:N,No,14,N,gap_severity,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,O:O,No,15,O,conversion_to_next,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,P:P,No,16,P,drop_off_rate,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,Q:Q,No,17,Q,revenue_impact,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,R:R,No,18,R,avg_time_in_stage,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,S:S,No,19,S,monthly_volume,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,T:T,No,20,T,friction_points,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,U:U,No,21,U,intervention_cost,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,V:V,No,22,V,roi_score,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,W:W,No,23,W,optimization_priority,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Touchpoints,1159260118,X:X,No,24,X,current_status,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,A:A,Interfaces_PK,1,A,interface_id,INT-01,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,B:B,No,2,B,interface_name,Design Tool,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,C:C,No,3,C,interface_type,Customer-Facing,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,D:D,No,4,D,primary_user,SEG-02/SEG-04,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,E:E,No,5,E,serves_flywheels_ids,FLW-01,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,F:F,No,6,F,serves_bus_ids,"BU-01,BU-02",No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,G:G,No,7,G,tech_stack,Custom Web App,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,H:H,No,8,H,owned_by_hub,HUB-01,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,I:I,No,9,I,owned_by_hub_name,Digital Platform,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,J:J,No,10,J,responsible_person,PER-09,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,K:K,No,11,K,priority_level,CRITICAL,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,L:L,No,12,L,build_status,ACTIVE,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,M:M,No,13,M,monthly_mau,212000,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,N:N,No,14,N,integration_points,"CHL-03,Product Catalog,Preview Engine,Cart",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,O:O,No,15,O,critical_to_operation,YES,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,P:P,No,16,P,bottleneck_risk,YES,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,Q:Q,No,17,Q,annual_volume,212000,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Interfaces,1827583571,R:R,No,18,R,notes,360° preview + doodle tool. CONVERSION CRISIS: 0.24% rate,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,A:A,Hubs_PK,1,A,hub_id,HUB-01,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,B:B,No,2,B,hub_name,Digital Platform,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,C:C,No,3,C,hub_type,Technology,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,D:D,No,4,D,owner_person,PER-05,No Protection,STRING,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,E:E,No,5,E,owner_person_name,Nirmal,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,F:F,No,6,F,core_capabilities,"Website, Design Tools, Partner Portal, Analytics, Payment",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,G:G,No,7,G,team_size,4,No Protection,NUMBER,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,H:H,No,8,H,monthly_capacity_constraint,26500 users/month,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,I:I,No,9,I,current_utilization_pct,98%,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,J:J,No,10,J,budget_monthly_inr,450000,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,K:K,No,11,K,status,,No Protection,BLANK,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,L:L,No,12,L,revenue_attribution_monthly,0,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,M:M,No,13,M,cost_center_or_profit,COST_CENTER,No Protection,STRING,No,LIST,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,N:N,No,14,N,interfaces_owned,"INT-01,INT-03,INT-06,INT-08,INT-09,INT-12,INT-16,INT-19",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,O:O,No,15,O,channels_owned,"CHL-03,CHL-06,CHL-17,CHL-18",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,P:P,No,16,P,primary_bottleneck,Infrastructure capacity,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,Q:Q,No,17,Q,scale_trigger_point,50K users/month,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Hubs,1497542620,R:R,No,18,R,note,CAPACITY_CRISIS,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,A:A,People_PK,1,A,user_id,PER-01,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,B:B,No,2,B,full_name,Vivek George,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,C:C,Role_People,3,C,role,FOUNDER,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,D:D,No,4,D,primary_hub,,No Protection,BLANK,No,RANGE,
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,E:E,No,5,E,primary_hub_name,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,F:F,No,6,F,owns_flywheels_ids,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,G:G,No,7,G,owns_segments_ids,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,H:H,No,8,H,owns_bus_ids,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,I:I,No,9,I,annual_comp_inr,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,J:J,No,10,J,capacity_utilization_pct,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,K:K,No,11,K,primary_okrs,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,L:L,No,12,L,email,vivek@yourdesignstore.in,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,M:M,No,13,M,phone,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,N:N,No,14,N,department,Founder,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,O:O,No,15,O,role_title,Sales specialist,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,P:P,No,16,P,manager_id,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,Q:Q,No,17,Q,employment_type,full_time,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,R:R,No,18,R,weekly_hours_capacity,40,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,S:S,No,19,S,location,Bangalore,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,People,1401300909,T:T,No,20,T,notes,"Production oversight, quality control, equipment management",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,A:A,Stages_PK,1,A,stage_id,STG-01,No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,B:B,No,2,B,stage_name,Awareness,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,C:C,No,3,C,flywheel,FLW-01,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,D:D,No,4,D,stage_order,1,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,E:E,No,5,E,stage_type,ACQUISITION,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,F:F,No,6,F,serves_segments,SEG-02,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,G:G,No,7,G,expected_conversion_rate,0.45,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,H:H,No,8,H,current_conversion_rate,0.4,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,I:I,No,9,I,benchmark_time,3s,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,J:J,No,10,J,current_time,3s,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,K:K,No,11,K,critical_to_revenue,NO,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,L:L,No,12,L,cumulative_conversion,0.4,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,M:M,No,13,M,monthly_volume_in,180000,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,N:N,No,14,N,monthly_volume_out,72000,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,O:O,No,15,O,revenue_per_stage,0,No Protection,NUMBER,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Stages,723169112,P:P,No,16,P,stage_description,Paid/organic discovery,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,KPI,2024151662,A:A,No,1,A,metric_name,,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,KPI,2024151662,B:B,No,2,B,kpi_id,,No Protection,BLANK,No,(None),`;

const rows = csvString.trim().split('\n');
const csvHeaderLine = rows.shift() || ''; // Get and remove header line
const csvActualHeaders = csvHeaderLine.split(',').map(h => h.trim());

for (let i = 0; i < rows.length; i++) {
  const values = rows[i].split(',');
  const rowObj: Record<string, string> = {};
  csvActualHeaders.forEach((h, idx) => (rowObj[h] = values[idx]?.trim() || ''));
  
  const sheetName = rowObj['sheet_name'];
  if (sheetName) {
    if (!csvDataBySheet.has(sheetName)) {
      csvDataBySheet.set(sheetName, []);
    }
    csvDataBySheet.get(sheetName)?.push({
      header: rowObj['header'],
      dataType: rowObj['Data_Type'],
      colIndex: parseInt(rowObj['col_index'], 10),
    });
  }
}

// Function to create column definitions from a Zod schema and CSV data
type InferredType = 'string' | 'number' | 'boolean' | 'string_array';

function inferTypeFromZod(zodType: z.ZodTypeAny): InferredType {
  // Handle optional types by unwrapping
  if (zodType instanceof z.ZodOptional || zodType instanceof z.ZodNullable) {
    return inferTypeFromZod(zodType.unwrap());
  }
  if (zodType instanceof z.ZodString) {
    // Check for preprocess to stringToArray
    // This is a heuristic: if a string type is usually an array in context, mark it as such
    // A more robust solution would involve Zod custom types or more complex schema introspection
    const description = (zodType as any)?._def?.description; // Check for custom description
    if (description === 'string_array') return 'string_array';

    // Heuristic for the preprocessor defined in schemas.ts
    const preprocessDef = (zodType as any)?._def?.innerType?._def?.typeName;
    if (preprocessDef === 'ZodArray') {
        return 'string_array';
    }
    return 'string';
  }
  if (zodType instanceof z.ZodNumber) return 'number';
  if (zodType instanceof z.ZodBoolean) return 'boolean';
  if (zodType instanceof z.ZodArray) return 'string_array'; // Assuming arrays are string arrays
  // For ZodUnion, try to infer a common type or default
  if (zodType instanceof z.ZodUnion) {
    const options = zodType.options;
    if (options.some((opt: any) => opt instanceof z.ZodString) && options.some((opt: any) => opt instanceof z.ZodNumber)) {
      return 'string'; // Default to string if it can be string or number
    }
    if (options.some((opt: any) => opt instanceof z.ZodArray)) return 'string_array';
  }

  // Fallback for unknown or complex types
  return 'string';
}

function createColumnsFromSchema<T extends z.ZodRawShape>(
    schema: z.ZodObject<T> | z.ZodEffects<z.ZodObject<T>>,
    sheetNameForCsvLookup: string,
): SheetConfig<z.infer<typeof schema>>['columns'] {
    const rawSchema = schema instanceof z.ZodEffects ? schema.innerType() : schema;
    const columns: SheetConfig<z.infer<typeof schema>>['columns'] = {};
    const csvHeaders = csvDataBySheet.get(sheetNameForCsvLookup) || [];
    
    for (const key in rawSchema.shape) {
        const zodType = rawSchema.shape[key];
        let inferredType: InferredType = inferTypeFromZod(zodType);

        // Try to find a matching header from the CSV data
        const csvColInfo = csvHeaders.find(
          (col) => normalizeString(col.header) === normalizeString(key) || 
                   (col.dataType === inferredType.toUpperCase() && normalizeString(col.header) === normalizeString(key))
        );
        
        let headerName = csvColInfo?.header || String(key);
        
        // Refine inferred type based on CSV data_type if available and makes sense
        if (csvColInfo?.dataType === 'NUMBER' && inferredType === 'string') {
          inferredType = 'number';
        } else if (csvColInfo?.dataType === 'BLANK' && inferredType !== 'string') {
          inferredType = 'string'; // Treat blank columns as string when mapping back
        } else if (csvColInfo?.dataType === 'STRING' && inferredType === 'number') {
          // If CSV says string but Zod says number, prefer string if no other strong indicator
          // This allows Zod's preprocess to handle conversion on read
          inferredType = 'string'; 
        }

        // Handle specific renames and type overrides if necessary
        // These are based on observed discrepancies between schema keys and actual sheet headers
        switch (String(key)) {
            case 'businessUnitId': headerName = 'bu_id'; break;
            case 'businessUnitName': headerName = 'bu_name'; break;
            case 'coreOffering': headerName = 'offering_description'; break;
            case 'primarySegments': headerName = 'serves_segments_ids'; inferredType = 'string_array'; break;
            case 'flywheelId': headerName = 'primary_flywheel_id'; break;
            case 'volumeRange': headerName = 'order_volume_range'; break;
            case 'primaryOwner': headerName = 'owner_person_id'; break;
            case 'nineMonthRevenue': headerName = '9mo_actual_revenue_inr'; break;
            case 'percentRevenue': headerName = 'revenue_share'; break; // Assuming percentage is often 'revenue_share'
            case 'pricingModel': headerName = 'pricing_model'; break;
            case 'segmentId': headerName = 'segment_id'; break;
            case 'segmentName': headerName = 'segment_name'; break;
            case 'customerProfile': headerName = 'customer_profile'; break;
            case 'flywheelName': headerName = 'flywheel_name'; break;
            case 'customerStruggleSolved': headerName = 'customer_struggle'; break;
            case 'acquisitionModel': headerName = 'sales_motion'; break;
            case 'serviceModel': headerName = 'support_model'; break;
            case 'keyMetrics': headerName = 'efficiency_metrics'; inferredType = 'string_array'; break;
            case 'hubId': headerName = 'hub_id'; break;
            case 'hubName': headerName = 'hub_name'; break;
            case 'hubType': headerName = 'hub_type'; break;
            case 'headCount': headerName = 'team_size'; break;
            case 'keyActivities': headerName = 'core_capabilities'; break;
            case 'platformId': headerName = 'platform_id'; break;
            case 'platformName': headerName = 'platform_name'; break;
            case 'platformType': headerName = 'platform_type'; break;
            case 'channelId': headerName = 'channel_id'; break;
            case 'channelName': headerName = 'channel_name'; break;
            case 'channelType': headerName = 'channel_type'; break;
            case 'owner': headerName = 'owner_person'; break; // For Hub, Platform etc. where owner is a person
            case 'Notes': headerName = 'Notes'; break; // Specific casing for Channels
            case 'Platform': headerName = 'Platform'; break; // Specific casing for Channels
            case 'responsible_person': headerName = 'responsible_person'; break; // Ensuring consistency
            case 'owner_person': headerName = 'owner_person'; break; // Ensuring consistency
            case 'owner_person_id': headerName = 'owner_person_id'; break; // Ensuring consistency
            case 'user_id': headerName = 'user_id'; break;
            case 'full_name': headerName = 'full_name'; break;
            case 'role': headerName = 'role'; break; // SystemPerson.role
            case 'primary_hub': headerName = 'primary_hub'; break;
            case 'braindump_id': headerName = 'braindump_id'; break;
            case 'timestamp': headerName = 'timestamp'; break;
            case 'content': headerName = 'content'; break;
            case 'user_email': headerName = 'user_email'; break;
            case 'priority': headerName = 'priority'; break;
            case 'email': headerName = 'email'; break;
            case 'phone': headerName = 'phone'; break;
            case 'role_title': headerName = 'role_title'; break;
            case 'is_active': headerName = 'is_active'; inferredType = 'boolean'; break;
            case 'annual_comp_inr': headerName = 'annual_comp_inr'; inferredType = 'number'; break;
            case 'capacity_utilization_pct': headerName = 'capacity_utilization_pct'; inferredType = 'number'; break;
            case 'primary_okrs': headerName = 'primary_okrs'; break;
            case 'title': headerName = 'task_name'; break; // TaskSchema.title maps to MgmtTask.task_name
            case 'estimate_hours': headerName = 'effort_hours'; break;
            case 'target_end_date': headerName = 'end_date'; break;
            case 'budget_planned': headerName = 'budget'; break;
            case 'serves_flywheels_ids': headerName = 'serves_flywheels_ids'; inferredType = 'string_array'; break;
            case 'serves_bus_ids': headerName = 'serves_bus_ids'; inferredType = 'string_array'; break;
            case 'platform_icon_url': headerName = 'platform_icon_url'; break;
            case 'platform_link_url': headerName = 'platform_link_url'; break;
            case 'interface_category': headerName = 'interface_type'; break; // For system interface
        }

        columns[key as keyof z.infer<typeof schema>] = {
            header: headerName,
            type: inferredType,
        };
    }
    return columns;
}


// Consolidated Sheet Configurations
export const allSheetConfigs = {
  // YDS Management (Spreadsheet: YDS_MANAGEMENT)
  Programs: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.ProgramSchema>> => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '0', // PROGRAMS sheet
    range: 'PROGRAMS!A:AZ',
    keyField: 'program_id',
    columns: createColumnsFromSchema(schemas.ProgramSchema, 'PROGRAMS'),
    schema: schemas.ProgramSchema,
  }),
  MgmtProjects: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.MgmtProjectSchema>> => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '719163995', // Project sheet
    range: 'Project!A:AZ',
    keyField: 'project_id',
    columns: createColumnsFromSchema(schemas.MgmtProjectSchema, 'Project'),
    schema: schemas.MgmtProjectSchema,
  }),
  Milestones: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.MilestoneSchema>> => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '246947641', // Milestones sheet
    range: 'Milestones!A:AZ',
    keyField: 'milestone_id',
    columns: createColumnsFromSchema(schemas.MilestoneSchema, 'Milestones'),
    schema: schemas.MilestoneSchema,
  }),
  MgmtTasks: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.MgmtTaskSchema>> => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '963211628', // task sheet
    range: 'task!A:AZ',
    keyField: 'task_id',
    columns: createColumnsFromSchema(schemas.MgmtTaskSchema, 'task'),
    schema: schemas.MgmtTaskSchema,
  }),
  MgmtHubs: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.MgmtHubSchema>> => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '1060642471', // Hubs(imported) sheet
    range: 'Hubs(imported)!A:AZ',
    keyField: 'team_id',
    columns: createColumnsFromSchema(schemas.MgmtHubSchema, 'Hubs(imported)'),
    schema: schemas.MgmtHubSchema,
  }),
  WeeklyUpdates: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.WeeklyUpdateSchema>> => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '1149179491', // WEEKLY UPDATES (Accountability Cadence) sheet
    range: 'WEEKLY UPDATES (Accountability Cadence)!A:AZ',
    keyField: 'update_id',
    columns: createColumnsFromSchema(
      schemas.WeeklyUpdateSchema,
      'WEEKLY UPDATES (Accountability Cadence)',
    ),
    schema: schemas.WeeklyUpdateSchema,
  }),
  DecisionLogs: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.DecisionLogSchema>> => ({
    spreadsheetId: ids.YDS_MANAGEMENT,
    gid: '891153943', // decision log sheet
    range: 'decision log!A:AZ',
    keyField: 'decision_id',
    columns: createColumnsFromSchema(schemas.DecisionLogSchema, 'decision log'),
    schema: schemas.DecisionLogSchema,
  }),

  // Strategy (Spreadsheet: YDC_BASE)
  'Business Units': (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.BusinessUnitSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1410852755', // BusinessUnits sheet
    range: 'BusinessUnits!A:AZ',
    keyField: 'businessUnitId',
    columns: createColumnsFromSchema(schemas.BusinessUnitSchema, 'BusinessUnits'),
    schema: schemas.BusinessUnitSchema,
  }),
  Flywheels: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.FlywheelSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '294604957', // Flywheels sheet
    range: 'Flywheels!A:AZ',
    keyField: 'flywheelId',
    columns: createColumnsFromSchema(schemas.FlywheelSchema, 'Flywheels'),
    schema: schemas.FlywheelSchema,
  }),
  'Customer Segments': (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.CustomerSegmentSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1781117501', // Segments sheet
    range: 'Segments!A:AZ',
    keyField: 'segmentId',
    columns: createColumnsFromSchema(schemas.CustomerSegmentSchema, 'Segments'),
    schema: schemas.CustomerSegmentSchema,
  }),

  // Marketing (Spreadsheet: YDC_BASE)
  Hubs: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.HubSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1497542620', // Hubs sheet
    range: 'Hubs!A:AZ',
    keyField: 'hubId',
    columns: createColumnsFromSchema(schemas.HubSchema, 'Hubs'),
    schema: schemas.HubSchema,
  }),
  Interfaces: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.InterfaceSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1827583571', // Interfaces sheet
    range: 'Interfaces!A:AZ',
    keyField: 'interface_id',
    columns: createColumnsFromSchema(schemas.InterfaceSchema, 'Interfaces'),
    schema: schemas.InterfaceSchema,
  }),
  Channels: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.ChannelSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '2050534733', // Channels sheet
    range: 'Channels!A:AZ',
    keyField: 'channelId',
    columns: createColumnsFromSchema(schemas.ChannelSchema, 'Channels'),
    schema: schemas.ChannelSchema,
  }),

  // Revenue (Spreadsheet: YDC_BASE)
  Leads: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.LeadSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1401300909', // People sheet (NOTE: This mapping is unusual; typically Leads would have their own sheet)
    range: 'People!A:AZ',
    keyField: 'lead_id', // Assuming user_id for now as it's the 'People' sheet
    columns: createColumnsFromSchema(schemas.LeadSchema, 'People'), // Need to align LeadSchema with People sheet columns
    schema: schemas.LeadSchema,
  }),
  Opportunities: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.OpportunitySchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '421613515', // DASHBOARD sheet (NOTE: This mapping is unusual)
    range: 'DASHBOARD!A:AZ',
    keyField: 'opportunity_id', // Placeholder
    columns: createColumnsFromSchema(schemas.OpportunitySchema, 'DASHBOARD'), // Need to align OpportunitySchema with Dashboard sheet columns
    schema: schemas.OpportunitySchema,
  }),
  Accounts: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.AccountSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '421613515', // DASHBOARD sheet (NOTE: This mapping is unusual)
    range: 'DASHBOARD!A:AZ',
    keyField: 'account_id', // Placeholder
    columns: createColumnsFromSchema(schemas.AccountSchema, 'DASHBOARD'), // Need to align AccountSchema with Dashboard sheet columns
    schema: schemas.AccountSchema,
  }),
  Partners: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.PartnerSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '594360110', // VALIDATION sheet (NOTE: This mapping is unusual)
    range: 'VALIDATION!A:AZ',
    keyField: 'partnerId', // Placeholder
    columns: createColumnsFromSchema(schemas.PartnerSchema, 'VALIDATION'), // Need to align PartnerSchema with Validation sheet columns
    schema: schemas.PartnerSchema,
  }),
  'Cost Structure': (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.CostStructureSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '594360110', // VALIDATION sheet (NOTE: This mapping is unusual)
    range: 'VALIDATION!A:AZ',
    keyField: 'costId', // Placeholder
    columns: createColumnsFromSchema(schemas.CostStructureSchema, 'VALIDATION'), // Need to align CostStructureSchema with Validation sheet columns
    schema: schemas.CostStructureSchema,
  }),
  'Revenue Streams': (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.RevenueStreamSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '594360110', // VALIDATION sheet (NOTE: This mapping is unusual)
    range: 'VALIDATION!A:AZ',
    keyField: 'revenueStreamId', // Placeholder
    columns: createColumnsFromSchema(
      schemas.RevenueStreamSchema,
      'VALIDATION',
    ), // Need to align RevenueStreamSchema with Validation sheet columns
    schema: schemas.RevenueStreamSchema,
  }),

  // YDS App (Spreadsheet: YDS_APP)
  BrainDump: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.BrainDumpSchema>> => ({
    spreadsheetId: ids.YDS_APP,
    gid: '0', // BrainDump sheet
    range: 'BrainDump!A:AZ',
    keyField: 'braindump_id',
    columns: createColumnsFromSchema(schemas.BrainDumpSchema, 'BrainDump'),
    schema: schemas.BrainDumpSchema,
  }),
  Logs: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.LogEntrySchema>> => ({
    spreadsheetId: ids.YDS_APP,
    gid: '344088187', // _Manifest sheet (NOTE: This mapping is unusual)
    range: '_Manifest!A:AZ',
    keyField: 'log_id', // Placeholder
    columns: createColumnsFromSchema(schemas.LogEntrySchema, '_Manifest'), // Need to align LogEntrySchema with _Manifest sheet columns
    schema: schemas.LogEntrySchema,
  }),
  Roles: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.RoleSchema>> => ({
    spreadsheetId: ids.YDS_APP,
    gid: '1446257232', // ROLES sheet
    range: 'ROLES!A:AZ',
    keyField: 'role_name',
    columns: createColumnsFromSchema(schemas.RoleSchema, 'ROLES'),
    schema: schemas.RoleSchema,
  }),

  // System Map Entities (Spreadsheet: YDC_BASE)
  SystemSegments: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.SystemSegmentSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1781117501', // Segments sheet
    range: 'Segments!A:AZ',
    keyField: 'segment_id',
    columns: createColumnsFromSchema(schemas.SystemSegmentSchema, 'Segments'),
    schema: schemas.SystemSegmentSchema,
  }),
  SystemFlywheels: (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.SystemFlywheelSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '294604957', // Flywheels sheet
    range: 'Flywheels!A:AZ',
    keyField: 'flywheel_id',
    columns: createColumnsFromSchema(schemas.SystemFlywheelSchema, 'Flywheels'),
    schema: schemas.SystemFlywheelSchema,
  }),
  SystemBusinessUnits: (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.SystemBusinessUnitSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1410852755', // BusinessUnits sheet
    range: 'BusinessUnits!A:AZ',
    keyField: 'bu_id',
    columns: createColumnsFromSchema(
      schemas.SystemBusinessUnitSchema,
      'BusinessUnits',
    ),
    schema: schemas.SystemBusinessUnitSchema,
  }),
  SystemChannels: (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.SystemChannelSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '2050534733', // Channels sheet
    range: 'Channels!A:AZ',
    keyField: 'channel_id',
    columns: createColumnsFromSchema(schemas.SystemChannelSchema, 'Channels'),
    schema: schemas.SystemChannelSchema,
  }),
  SystemInterfaces: (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.SystemInterfaceSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1827583571', // Interfaces sheet
    range: 'Interfaces!A:AZ',
    keyField: 'interface_id',
    columns: createColumnsFromSchema(
      schemas.SystemInterfaceSchema,
      'Interfaces',
    ),
    schema: schemas.SystemInterfaceSchema,
  }),
  SystemHubs: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.SystemHubSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1497542620', // Hubs sheet
    range: 'Hubs!A:AZ',
    keyField: 'hub_id',
    columns: createColumnsFromSchema(schemas.SystemHubSchema, 'Hubs'),
    schema: schemas.SystemHubSchema,
  }),
  SystemPeople: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.SystemPersonSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1401300909', // People sheet
    range: 'People!A:AZ',
    keyField: 'user_id',
    columns: createColumnsFromSchema(schemas.SystemPersonSchema, 'People'),
    schema: schemas.SystemPersonSchema,
  }),
  SystemStages: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.SystemStageSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '723169112', // Stages sheet
    range: 'Stages!A:AZ',
    keyField: 'stage_id',
    columns: createColumnsFromSchema(schemas.SystemStageSchema, 'Stages'),
    schema: schemas.SystemStageSchema,
  }),
  SystemTouchpoints: (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.SystemTouchpointSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1159260118', // Touchpoints sheet
    range: 'Touchpoints!A:AZ',
    keyField: 'touchpoint_id',
    columns: createColumnsFromSchema(
      schemas.SystemTouchpointSchema,
      'Touchpoints',
    ),
    schema: schemas.SystemTouchpointSchema,
  }),
  SystemPlatforms: (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.SystemPlatformSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1976934144', // Platforms sheet
    range: 'Platforms!A:AZ',
    keyField: 'platform_id',
    columns: createColumnsFromSchema(schemas.SystemPlatformSchema, 'Platforms'),
    schema: schemas.SystemPlatformSchema,
  }),

  // Strategy - Specific Views (Spreadsheet: YDC_BASE)
  FlywheelStrategies: (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.FlywheelStrategySchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '294604957', // Flywheels sheet
    range: 'Flywheels!A:AZ', // Reusing Flywheels for this view
    keyField: 'flywheelId',
    columns: createColumnsFromSchema(
      schemas.FlywheelStrategySchema,
      'Flywheels',
    ),
    schema: schemas.FlywheelStrategySchema,
  }),
  SegmentPositionings: (
    ids: SpreadsheetIds,
  ): SheetConfig<z.infer<typeof schemas.SegmentPositioningSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1781117501', // Segments sheet
    range: 'Segments!A:AZ', // Reusing Segments for this view
    keyField: 'segment',
    columns: createColumnsFromSchema(
      schemas.SegmentPositioningSchema,
      'Segments',
    ),
    schema: schemas.SegmentPositioningSchema,
  }),
  FunnelStages: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.FunnelStageSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '723169112', // Stages sheet
    range: 'Stages!A:AZ', // Reusing Stages for this view
    keyField: 'stageId',
    columns: createColumnsFromSchema(schemas.FunnelStageSchema, 'Stages'),
    schema: schemas.FunnelStageSchema,
  }),
  InterfaceMaps: (ids: SpreadsheetIds): SheetConfig<z.infer<typeof schemas.InterfaceMapSchema>> => ({
    spreadsheetId: ids.YDC_BASE,
    gid: '1827583571', // Interfaces sheet
    range: 'Interfaces!A:AZ', // Reusing Interfaces for this view
    keyField: 'interfaceId',
    columns: createColumnsFromSchema(schemas.InterfaceMapSchema, 'Interfaces'),
    schema: schemas.InterfaceMapSchema,
  }),
};

// Predefined relations for health checks
export const predefinedRelations = [
  // Program Relations
  {
    from: 'Programs',
    fromField: 'owner_person_id',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'Programs',
    fromField: 'flywheel_id',
    to: 'SystemFlywheels',
    toField: 'flywheel_id',
  },
  {
    from: 'Programs',
    fromField: 'serves_segment_ids',
    to: 'SystemSegments',
    toField: 'segment_id',
  },
  {
    from: 'Programs',
    fromField: 'owner_hub_id',
    to: 'SystemHubs',
    toField: 'hub_id',
  },
  {
    from: 'Programs',
    fromField: 'contributing_hub_ids',
    to: 'SystemHubs',
    toField: 'hub_id',
  },
  {
    from: 'Programs',
    fromField: 'linked_business_unit_ids',
    to: 'SystemBusinessUnits',
    toField: 'bu_id',
  },
  {
    from: 'Programs',
    fromField: 'platform_ids',
    to: 'SystemPlatforms',
    toField: 'platform_id',
  },
  {
    from: 'Programs',
    fromField: 'channel_ids',
    to: 'SystemChannels',
    toField: 'channel_id',
  },

  // Project Relations
  {
    from: 'MgmtProjects',
    fromField: 'program_id',
    to: 'Programs',
    toField: 'program_id',
  },
  {
    from: 'MgmtProjects',
    fromField: 'owner_id',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'MgmtProjects',
    fromField: 'hub_id',
    to: 'SystemHubs',
    toField: 'hub_id',
  },
  {
    from: 'MgmtProjects',
    fromField: 'platform_id',
    to: 'SystemPlatforms',
    toField: 'platform_id',
  },
  {
    from: 'MgmtProjects',
    fromField: 'channel_ids',
    to: 'SystemChannels',
    toField: 'channel_id',
  },

  // Milestone Relations
  {
    from: 'Milestones',
    fromField: 'project_id',
    to: 'MgmtProjects',
    toField: 'project_id',
  },
  {
    from: 'Milestones',
    fromField: 'owner_id',
    to: 'SystemPeople',
    toField: 'user_id',
  },

  // Task Relations
  {
    from: 'MgmtTasks',
    fromField: 'project_id',
    to: 'MgmtProjects',
    toField: 'project_id',
  },
  {
    from: 'MgmtTasks',
    fromField: 'milestone_id',
    to: 'Milestones',
    toField: 'milestone_id',
  },
  {
    from: 'MgmtTasks',
    fromField: 'assignee_ids',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'MgmtTasks',
    fromField: 'hub_id',
    to: 'SystemHubs',
    toField: 'hub_id',
  },

  // Business Unit Relations
  {
    from: 'Business Units',
    fromField: 'owner_person_id',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'Business Units',
    fromField: 'primary_flywheel_id',
    to: 'SystemFlywheels',
    toField: 'flywheel_id',
  },
  {
    from: 'Business Units',
    fromField: 'serves_segments_ids',
    to: 'SystemSegments',
    toField: 'segment_id',
  },

  // Flywheel Relations
  {
    from: 'Flywheels',
    fromField: 'owner_person',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'Flywheels',
    fromField: 'serves_segments',
    to: 'SystemSegments',
    toField: 'segment_id',
  },
  {
    from: 'Flywheels',
    fromField: 'serves_bus',
    to: 'SystemBusinessUnits',
    toField: 'bu_id',
  },

  // Customer Segment Relations
  {
    from: 'Customer Segments',
    fromField: 'owner_person_id',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'Customer Segments',
    fromField: 'served_by_flywheels_ids',
    to: 'SystemFlywheels',
    toField: 'flywheel_id',
  },
  {
    from: 'Customer Segments',
    fromField: 'bu_id',
    to: 'SystemBusinessUnits',
    toField: 'bu_id',
  },

  // Hub Relations
  {
    from: 'Hubs',
    fromField: 'owner_person',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'Hubs',
    fromField: 'interfaces_owned',
    to: 'SystemInterfaces',
    toField: 'interface_id',
  },
  {
    from: 'Hubs',
    fromField: 'channels_owned',
    to: 'SystemChannels',
    toField: 'channel_id',
  },

  // Interface Relations
  {
    from: 'Interfaces',
    fromField: 'responsible_person',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'Interfaces',
    fromField: 'serves_flywheels_ids',
    to: 'SystemFlywheels',
    toField: 'flywheel_id',
  },
  {
    from: 'Interfaces',
    fromField: 'serves_bus_ids',
    to: 'SystemBusinessUnits',
    toField: 'bu_id',
  },
  {
    from: 'Interfaces',
    fromField: 'owned_by_hub',
    to: 'SystemHubs',
    toField: 'hub_id',
  },

  // Channel Relations
  {
    from: 'Channels',
    fromField: 'responsible_person',
    to: 'SystemPeople',
    toField: 'user_id',
  },
  {
    from: 'Channels',
    fromField: 'serves_flywheels',
    to: 'SystemFlywheels',
    toField: 'flywheel_id',
  },
  {
    from: 'Channels',
    fromField: 'serves_bus',
    to: 'SystemBusinessUnits',
    toField: 'bu_id',
  },
  {
    from: 'Channels',
    fromField: 'serves_primary_platform_ids',
    to: 'SystemPlatforms',
    toField: 'platform_id',
  },

  // Person Relations
  {
    from: 'SystemPeople',
    fromField: 'primary_hub',
    to: 'SystemHubs',
    toField: 'hub_id',
  },
  {
    from: 'SystemPeople',
    fromField: 'owns_business_units_ids',
    to: 'SystemBusinessUnits',
    toField: 'bu_id',
  },
  {
    from: 'SystemPeople',
    fromField: 'owns_channels_ids',
    to: 'SystemChannels',
    toField: 'channel_id',
  },
  {
    from: 'SystemPeople',
    fromField: 'owns_flywheels_ids',
    to: 'SystemFlywheels',
    toField: 'flywheel_id',
  },
  {
    from: 'SystemPeople',
    fromField: 'owns_interfaces_ids',
    to: 'SystemInterfaces',
    toField: 'interface_id',
  },
  {
    from: 'SystemPeople',
    fromField: 'owns_platforms_ids',
    to: 'SystemPlatforms',
    toField: 'platform_id',
  },
  {
    from: 'SystemPeople',
    fromField: 'owns_segments_ids',
    to: 'SystemSegments',
    toField: 'segment_id',
  },
  {
    from: 'SystemPeople',
    fromField: 'owns_stages_ids',
    to: 'SystemStages',
    toField: 'stage_id',
  },
  {
    from: 'SystemPeople',
    fromField: 'owns_touchpoints_ids',
    to: 'SystemTouchpoints',
    toField: 'touchpoint_id',
  },

  // Stage Relations
  {
    from: 'SystemStages',
    fromField: 'flywheel',
    to: 'SystemFlywheels',
    toField: 'flywheel_id',
  },
  {
    from: 'SystemStages',
    fromField: 'serves_segments',
    to: 'SystemSegments',
    toField: 'segment_id',
  },

  // Touchpoint Relations
  {
    from: 'SystemTouchpoints',
    fromField: 'stage_id',
    to: 'SystemStages',
    toField: 'stage_id',
  },
  {
    from: 'SystemTouchpoints',
    fromField: 'flywheel_id',
    to: 'SystemFlywheels',
    toField: 'flywheel_id',
  },
  {
    from: 'SystemTouchpoints',
    fromField: 'channel_id',
    to: 'SystemChannels',
    toField: 'channel_id',
  },
  {
    from: 'SystemTouchpoints',
    fromField: 'interface_id',
    to: 'SystemInterfaces',
    toField: 'interface_id',
  },
  {
    from: 'SystemTouchpoints',
    fromField: 'responsible_hub_id',
    to: 'SystemHubs',
    toField: 'hub_id',
  },
  {
    from: 'SystemTouchpoints',
    fromField: 'responsible_person_id',
    to: 'SystemPeople',
    toField: 'user_id',
  },

  // Platform Relations
  {
    from: 'SystemPlatforms',
    fromField: 'owner_hub',
    to: 'SystemHubs',
    toField: 'hub_id',
  },
  {
    from: 'SystemPlatforms',
    fromField: 'primary_segments',
    to: 'SystemSegments',
    toField: 'segment_id',
  },
];