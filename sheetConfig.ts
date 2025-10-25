// This file defines the static structure of the Google Sheets used by the application.
// While some configuration is loaded dynamically, this provides the base schemas and groupings.

import { z, ZodObject, ZodLiteral } from 'zod'; // Import ZodLiteral
import * as schemas from './schemas';
import { optionalString, optionalNumber, optionalBoolean, stringToArray } from './schemas'; // Import preprocessors
import type { SpreadsheetIds } from './contexts/SpreadsheetConfigContext';
import type { SheetConfig } from './services/googleSheetService';
import { appStructure } from './config/appStructure';
import type { MasterSchemaRow } from './types'; // Import MasterSchemaRow

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
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,VALIDATION,594360110,D:D,4,D,Applied On (Sheet.Header),BusinessUnits.status; Products.status; Tasks.status,No Protection,STRING,No,(None),
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
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,D:D,4,D,(Col D - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,E:E,No,5,E,(Col E - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,F:F,No,6,F,(Col F - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,DASHBOARD,421613515,G:G,No,7,G,(Col G - Blank),,No Protection,BLANK,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,A:A,Segments_PK,1,A,segment_id,SEG-01,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,B:B,No,2,B,segment_name,D2C Lifecycle,No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,C:C,No,3,C,customer_facing,YDS Direct (self-service),No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,D:D,4,D,Positioning,Personal expression made physical - no minimums,No Protection,STRING,No,(None),
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
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,T:T,20,T,Platforms,"PLT-01, PLT-03, PLT-04",No Protection,STRING,Yes,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,U:U,No,21,U,behavioral_truth,"LIFECYCLE MODEL: 3,625 New (₹12K AOV, 1x order) → 3,549 Repeat (₹15K AOV, 1.5x reorder). 36% convert New→Repeat. Acquisition expensive, retention profitable.",No Protection,STRING,No,(None),
1HXIoXZLDzXtB7aOy23AapoHhP8xgLxm_K8VcQ2KPvsY,YDC - Base,Segments,1781117501,V:V,No,22,V,strategic_notes,PROFIT`;

csvString.split('\n').slice(1).forEach(row => {
    const columns = row.split(',');
    const sheetName = columns[2];
    const header = columns[8];
    const dataType = columns[11];
    const colIndex = parseInt(columns[6], 10);
    if (!csvDataBySheet.has(sheetName)) {
        csvDataBySheet.set(sheetName, []);
    }
    csvDataBySheet.get(sheetName)?.push({ header, dataType, colIndex });
});


/**
 * Dynamically constructs the columns configuration for a SheetConfig based on its Zod schema
 * and the hardcoded CSV metadata.
 *
 * @param schema The Zod schema for the entity type.
 * @param alias The table alias (e.g., 'SystemPeople', 'Business Units').
 * @param spreadsheetIds Current global spreadsheet IDs for context.
 * @returns A columns object suitable for SheetConfig.
 */
function getColumnConfig<T extends z.ZodTypeAny>(
  schema: T,
  alias: string,
  spreadsheetIds: SpreadsheetIds,
): SheetConfig<z.infer<T>>['columns'] {
  const columns: SheetConfig<z.infer<T>>['columns'] = {};
  // FIX: Changed type assertion to accurately reflect the schema type.
  const entitySchema = schema as z.ZodObject<any, 'strip', any>; 

  const schemaShape = entitySchema.shape; // Get the shape of the Zod object

  const sheetName = (appStructure as any)[alias]?.range?.split('!')[0].replace(/'/g, '') || alias; // Derive sheet name

  const sheetCsvData = csvDataBySheet.get(sheetName);

  for (const key in schemaShape) {
    const schemaField = schemaShape[key];

    // Attempt to find the header from CSV data based on normalized keys
    const csvColumn = sheetCsvData?.find(col => normalizeString(col.header) === normalizeString(key));

    let headerName = csvColumn?.header || key; // Default to key if not found in CSV
    let dataType: 'string' | 'number' | 'boolean' | 'string_array' = 'string';

    // Infer data type from Zod schema first
    if (schemaField instanceof z.ZodNumber) {
        dataType = 'number';
    } else if (schemaField instanceof z.ZodBoolean) {
        dataType = 'boolean';
    } else if (schemaField instanceof z.ZodArray && (schemaField as any)._def.type.element instanceof z.ZodString) { // Check for string arrays, including preprocessed ones
        dataType = 'string_array';
    } else if (schemaField instanceof ZodLiteral && typeof schemaField.value === 'string') {
        dataType = 'string'; // Treat ZodLiterals as strings for header mapping
    } else if (schemaField instanceof z.ZodEnum) {
        dataType = 'string'; // Enums are strings in sheets
    } else if (schemaField instanceof z.ZodUnion && schemaField.options.some((opt: any) => opt instanceof z.ZodString || opt instanceof z.ZodNumber)) {
        // For union types like z.union([z.string(), z.number()]), default to string for sheet representation
        dataType = 'string';
    } else if (schemaField instanceof z.ZodOptional) {
        // If it's an optional type, check its inner type
        const innerType = (schemaField as any)._def.innerType;
        if (innerType instanceof z.ZodNumber) {
            dataType = 'number';
        } else if (innerType instanceof z.ZodBoolean) {
            dataType = 'boolean';
        } else if (innerType instanceof z.ZodArray && (innerType as any)._def.type.element instanceof z.ZodString) { // Check for string arrays
            dataType = 'string_array';
        }
    }


    // Override with CSV data type if available and more specific
    if (csvColumn && csvColumn.dataType) {
        const normalizedCsvType = csvColumn.dataType.toLowerCase();
        if (normalizedCsvType.includes('number')) {
            dataType = 'number';
        } else if (normalizedCsvType.includes('boolean')) {
            dataType = 'boolean';
        } else if (normalizedCsvType.includes('string_array')) { // Custom type for CSV
            dataType = 'string_array';
        }
        // If CSV says 'string' or 'blank', Zod's inference is likely better unless it's a known array type.
    }
    
    // Add internal _rowIndex field for AppSheetRow and MasterSchemaRow
    if (key === '_rowIndex') {
      columns[key as keyof z.infer<T>] = { header: '_rowIndex', type: 'number' };
      continue; // Skip further processing for _rowIndex
    }

    columns[key as keyof z.infer<T>] = {
      header: headerName,
      type: dataType,
    };
  }

  return columns;
}

// Pre-declare allSheetConfigs for use in getColumnConfig
export const allSheetConfigs = (
  spreadsheetIds: SpreadsheetIds,
): Record<string, SheetConfig<any>> => ({
  // YDS App Configuration Sheet
  App: {
    spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
    gid: '0', // Default GID for the first sheet
    range: 'App!A:Z',
    keyField: '_rowIndex', // App sheet uses _rowIndex for internal updates
    schema: schemas.AppSheetRowSchema,
    columns: getColumnConfig(schemas.AppSheetRowSchema, 'App', spreadsheetIds),
  },
  MasterSchemaRows: {
    spreadsheetId: spreadsheetIds.MASTER_SCHEMA,
    gid: '594360110', // GID for the "HEADERS_SNAPSHOT_PARENT" sheet in YDC - Base
    range: 'HEADERS_SNAPSHOT_PARENT!A:AZ',
    keyField: '_rowIndex',
    schema: schemas.MasterSchemaRowSchema,
    columns: getColumnConfig(schemas.MasterSchemaRowSchema, 'MasterSchemaRows', spreadsheetIds),
  },

  // Core Management
  Programs: {
    spreadsheetId: spreadsheetIds.YDS_MANAGEMENT,
    gid: '1587635398',
    range: 'Programs!A:AZ',
    keyField: 'program_id',
    schema: schemas.ProgramSchema,
    columns: getColumnConfig(schemas.ProgramSchema, 'Programs', spreadsheetIds),
  },
  MgmtProjects: {
    spreadsheetId: spreadsheetIds.YDS_MANAGEMENT,
    gid: '0',
    range: 'Projects!A:AZ',
    keyField: 'project_id',
    schema: schemas.MgmtProjectSchema,
    columns: getColumnConfig(schemas.MgmtProjectSchema, 'MgmtProjects', spreadsheetIds),
  },
  Milestones: {
    spreadsheetId: spreadsheetIds.YDS_MANAGEMENT,
    gid: '1752847528',
    range: 'Milestones!A:AZ',
    keyField: 'milestone_id',
    schema: schemas.MilestoneSchema,
    columns: getColumnConfig(schemas.MilestoneSchema, 'Milestones', spreadsheetIds),
  },
  MgmtTasks: {
    spreadsheetId: spreadsheetIds.YDS_MANAGEMENT,
    gid: '1615967912',
    range: 'Tasks!A:AZ',
    keyField: 'task_id',
    schema: schemas.MgmtTaskSchema,
    columns: getColumnConfig(schemas.MgmtTaskSchema, 'MgmtTasks', spreadsheetIds),
  },
  MgmtHubs: {
    spreadsheetId: spreadsheetIds.YDS_MANAGEMENT,
    gid: '1097241019',
    range: 'Hubs!A:AZ',
    keyField: 'team_id',
    schema: schemas.MgmtHubSchema,
    columns: getColumnConfig(schemas.MgmtHubSchema, 'MgmtHubs', spreadsheetIds),
  },
  WeeklyUpdates: {
    spreadsheetId: spreadsheetIds.YDS_MANAGEMENT,
    gid: '175825708',
    range: 'Weekly Updates!A:AZ',
    keyField: 'update_id',
    schema: schemas.WeeklyUpdateSchema,
    columns: getColumnConfig(schemas.WeeklyUpdateSchema, 'WeeklyUpdates', spreadsheetIds),
  },
  DecisionLogs: {
    spreadsheetId: spreadsheetIds.YDS_MANAGEMENT,
    gid: '1138769399',
    range: 'Decision Log!A:AZ',
    keyField: 'decision_id',
    schema: schemas.DecisionLogSchema,
    columns: getColumnConfig(schemas.DecisionLogSchema, 'DecisionLogs', spreadsheetIds),
  },

  // Core Data (People & Roles)
  People: {
    spreadsheetId: spreadsheetIds.YDC_BASE,
    gid: '1138769399', // Placeholder GID
    range: 'People!A:AZ',
    keyField: 'user_id',
    schema: schemas.PersonSchema,
    columns: getColumnConfig(schemas.PersonSchema, 'People', spreadsheetIds),
  },
  Roles: {
    spreadsheetId: spreadsheetIds.YDC_BASE,
    gid: '1241160161', // Placeholder GID
    range: 'Roles!A:AZ',
    keyField: 'role_name',
    schema: schemas.RoleSchema,
    columns: getColumnConfig(schemas.RoleSchema, 'Roles', spreadsheetIds),
  },
  
  // Strategy & Business Model Canvas
  'Business Units': {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '0',
    range: 'Business Units!A:AZ',
    keyField: 'bu_id',
    schema: schemas.BusinessUnitSchema,
    columns: getColumnConfig(schemas.BusinessUnitSchema, 'Business Units', spreadsheetIds),
  },
  Flywheels: {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '1970228833',
    range: 'Flywheels!A:AZ',
    keyField: 'flywheel_id',
    schema: schemas.FlywheelSchema,
    columns: getColumnConfig(schemas.FlywheelSchema, 'Flywheels', spreadsheetIds),
  },
  'Customer Segments': {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '1781117501',
    range: 'Customer Segments!A:AZ',
    keyField: 'segment_id',
    schema: schemas.CustomerSegmentSchema,
    columns: getColumnConfig(schemas.CustomerSegmentSchema, 'Customer Segments', spreadsheetIds),
  },
  FlywheelStrategies: {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '915993510',
    range: 'Flywheel Strategy!A:AZ',
    keyField: 'flywheelId',
    schema: schemas.FlywheelStrategySchema,
    columns: getColumnConfig(schemas.FlywheelStrategySchema, 'FlywheelStrategies', spreadsheetIds),
  },
  SegmentPositionings: {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '1192534575',
    range: 'Segment Positioning!A:AZ',
    keyField: 'segment',
    schema: schemas.SegmentPositioningSchema,
    columns: getColumnConfig(schemas.SegmentPositioningSchema, 'SegmentPositionings', spreadsheetIds),
  },
  FunnelStages: {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '1418702005',
    range: 'Funnel Stages!A:AZ',
    keyField: 'stageId',
    // FIX: Corrected typo from FunnelStagesSchema to FunnelStageSchema.
    schema: schemas.FunnelStageSchema,
    columns: getColumnConfig(schemas.FunnelStageSchema, 'FunnelStages', spreadsheetIds),
  },
  InterfaceMaps: {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '1097241019', // Placeholder - should be dynamic
    range: 'Interface Map!A:AZ',
    keyField: 'interfaceId',
    schema: schemas.InterfaceMapSchema,
    columns: getColumnConfig(schemas.InterfaceMapSchema, 'InterfaceMaps', spreadsheetIds),
  },


  // System Map Entities (Detailed)
  SystemSegments: {
    spreadsheetId: spreadsheetIds.STRATEGY, // Use Strategy sheet for System Segments
    gid: '1781117501',
    range: 'Segments!A:AZ',
    keyField: 'segment_id',
    schema: schemas.SystemSegmentSchema,
    columns: getColumnConfig(schemas.SystemSegmentSchema, 'SystemSegments', spreadsheetIds),
  },
  SystemFlywheels: {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '1970228833',
    range: 'Flywheels!A:AZ',
    keyField: 'flywheel_id',
    schema: schemas.SystemFlywheelSchema,
    columns: getColumnConfig(schemas.SystemFlywheelSchema, 'SystemFlywheels', spreadsheetIds),
  },
  SystemBusinessUnits: {
    spreadsheetId: spreadsheetIds.STRATEGY,
    gid: '0',
    range: 'Business Units!A:AZ',
    keyField: 'bu_id',
    schema: schemas.SystemBusinessUnitSchema,
    columns: getColumnConfig(schemas.SystemBusinessUnitSchema, 'SystemBusinessUnits', spreadsheetIds),
  },
  SystemChannels: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Channels are defined in YDC_BASE
    gid: '1738714073', // Placeholder GID
    range: 'Channels!A:AZ',
    keyField: 'channel_id',
    schema: schemas.SystemChannelSchema,
    columns: getColumnConfig(schemas.SystemChannelSchema, 'SystemChannels', spreadsheetIds),
  },
  SystemInterfaces: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Interfaces are defined in YDC_BASE
    gid: '840003000', // Placeholder GID
    range: 'Interfaces!A:AZ',
    keyField: 'interface_id',
    schema: schemas.SystemInterfaceSchema,
    columns: getColumnConfig(schemas.SystemInterfaceSchema, 'SystemInterfaces', spreadsheetIds),
  },
  SystemHubs: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Hubs are defined in YDC_BASE
    gid: '1097241019', // Placeholder GID
    range: 'Hubs!A:AZ',
    keyField: 'hub_id',
    schema: schemas.SystemHubSchema,
    columns: getColumnConfig(schemas.SystemHubSchema, 'SystemHubs', spreadsheetIds),
  },
  SystemPeople: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // People are defined in YDC_BASE
    gid: '1138769399', // Placeholder GID
    range: 'People!A:AZ',
    keyField: 'user_id',
    schema: schemas.SystemPersonSchema,
    columns: getColumnConfig(schemas.SystemPersonSchema, 'SystemPeople', spreadsheetIds),
  },
  SystemStages: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Stages defined in YDC_BASE
    gid: '0', // Placeholder GID
    range: 'Stages!A:AZ',
    keyField: 'stage_id',
    schema: schemas.SystemStageSchema,
    columns: getColumnConfig(schemas.SystemStageSchema, 'SystemStages', spreadsheetIds),
  },
  SystemTouchpoints: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Touchpoints defined in YDC_BASE
    gid: '0', // Placeholder GID
    range: 'Touchpoints!A:AZ',
    keyField: 'touchpoint_id',
    schema: schemas.SystemTouchpointSchema,
    columns: getColumnConfig(schemas.SystemTouchpointSchema, 'SystemTouchpoints', spreadsheetIds),
  },
  SystemPlatforms: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Platforms defined in YDC_BASE
    gid: '0', // Placeholder GID
    range: 'Platforms!A:AZ',
    keyField: 'platform_id',
    schema: schemas.SystemPlatformSchema,
    columns: getColumnConfig(schemas.SystemPlatformSchema, 'SystemPlatforms', spreadsheetIds),
  },

  // Leads, Opportunities, Accounts
  Leads: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Placeholder for YDC_BASE
    gid: '0', // Placeholder GID
    range: 'Leads!A:AZ',
    keyField: 'lead_id',
    schema: schemas.LeadSchema,
    columns: getColumnConfig(schemas.LeadSchema, 'Leads', spreadsheetIds),
  },
  Opportunities: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Placeholder for YDC_BASE
    gid: '0', // Placeholder GID
    range: 'Opportunities!A:AZ',
    keyField: 'opportunity_id',
    schema: schemas.OpportunitySchema,
    columns: getColumnConfig(schemas.OpportunitySchema, 'Opportunities', spreadsheetIds),
  },
  Accounts: {
    spreadsheetId: spreadsheetIds.YDC_BASE, // Placeholder for YDC_BASE
    gid: '0', // Placeholder GID
    range: 'Accounts!A:AZ',
    keyField: 'account_id',
    schema: schemas.AccountSchema,
    columns: getColumnConfig(schemas.AccountSchema, 'Accounts', spreadsheetIds),
  },

  // BrainDump
  BrainDump: {
    spreadsheetId: spreadsheetIds.YDS_APP,
    gid: '154035653',
    range: 'BrainDump!A:AZ',
    keyField: 'braindump_id',
    schema: schemas.BrainDumpSchema,
    columns: getColumnConfig(schemas.BrainDumpSchema, 'BrainDump', spreadsheetIds),
  },
  Logs: {
    spreadsheetId: spreadsheetIds.YDS_APP,
    gid: '1853685365', // Placeholder GID
    range: 'Logs!A:AZ',
    keyField: 'log_id',
    schema: schemas.LogEntrySchema,
    columns: getColumnConfig(schemas.LogEntrySchema, 'Logs', spreadsheetIds),
  },

  // Partners
  Partners: {
    spreadsheetId: spreadsheetIds.PARTNERS,
    gid: '0', // Placeholder GID
    range: 'Partners!A:AZ',
    keyField: 'partnerId',
    schema: schemas.PartnerSchema,
    columns: getColumnConfig(schemas.PartnerSchema, 'Partners', spreadsheetIds),
  },
  'Cost Structure': {
    spreadsheetId: spreadsheetIds.PARTNERS,
    gid: '0', // Placeholder GID
    range: 'Cost Structure!A:AZ',
    keyField: 'costId',
    schema: schemas.CostStructureSchema,
    columns: getColumnConfig(schemas.CostStructureSchema, 'Cost Structure', spreadsheetIds),
  },
  'Revenue Streams': {
    spreadsheetId: spreadsheetIds.PARTNERS,
    gid: '0', // Placeholder GID
    range: 'Revenue Streams!A:AZ',
    keyField: 'revenueStreamId',
    schema: schemas.RevenueStreamSchema,
    columns: getColumnConfig(schemas.RevenueStreamSchema, 'Revenue Streams', spreadsheetIds),
  },
});

// Predefined relations for schema health check (Foreign Key references)
export const predefinedRelations = [
  { from: 'MgmtProjects', fromField: 'owner_id', to: 'SystemPeople', toField: 'user_id' },
  { from: 'MgmtProjects', fromField: 'hub_id', to: 'SystemHubs', toField: 'hub_id' },
  { from: 'MgmtProjects', fromField: 'program_id', to: 'Programs', toField: 'program_id' },
  { from: 'Milestones', fromField: 'project_id', to: 'MgmtProjects', toField: 'project_id' },
  { from: 'Milestones', fromField: 'owner_id', to: 'SystemPeople', toField: 'user_id' },
  { from: 'MgmtTasks', fromField: 'project_id', to: 'MgmtProjects', toField: 'project_id' },
  { from: 'MgmtTasks', fromField: 'milestone_id', to: 'Milestones', toField: 'milestone_id' },
  { from: 'MgmtTasks', fromField: 'assignee_ids', to: 'SystemPeople', toField: 'user_id' },
  { from: 'MgmtTasks', fromField: 'hub_id', to: 'SystemHubs', toField: 'hub_id' },
  { from: 'MgmtTasks', fromField: 'dependencies', to: 'MgmtTasks', toField: 'task_id' }, // Self-referencing
  { from: 'Programs', fromField: 'owner_person_id', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Programs', fromField: 'flywheel_id', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'Programs', fromField: 'owner_hub_id', to: 'SystemHubs', toField: 'hub_id' },
  { from: 'Programs', fromField: 'serves_segment_ids', to: 'SystemSegments', toField: 'segment_id' },
  { from: 'Programs', fromField: 'platform_ids', to: 'SystemPlatforms', toField: 'platform_id' },
  { from: 'Programs', fromField: 'channel_ids', to: 'SystemChannels', toField: 'channel_id' },

  // Strategy relations
  { from: 'Business Units', fromField: 'owner_person_id', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Business Units', fromField: 'primary_flywheel_id', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'Business Units', fromField: 'serves_segments_ids', to: 'SystemSegments', toField: 'segment_id' },
  { from: 'Flywheels', fromField: 'owner_person', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Flywheels', fromField: 'serves_segments', to: 'SystemSegments', toField: 'segment_id' },
  { from: 'Customer Segments', fromField: 'owner_person_id', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Customer Segments', fromField: 'bu_id', to: 'SystemBusinessUnits', toField: 'bu_id' },
  { from: 'Customer Segments', fromField: 'served_by_flywheels_ids', to: 'SystemFlywheels', toField: 'flywheel_id' },

  // Marketing relations
  { from: 'Hubs', fromField: 'owner_person', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Interfaces', fromField: 'responsible_person', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Interfaces', fromField: 'owned_by_hub', to: 'SystemHubs', toField: 'hub_id' },
  { from: 'Channels', fromField: 'responsible_person', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Channels', fromField: 'serves_flywheels', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'Channels', fromField: 'serves_bus', to: 'SystemBusinessUnits', toField: 'bu_id' },

  // Revenue relations
  { from: 'Leads', fromField: 'sdr_owner_fk', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Opportunities', fromField: 'owner_user_id', to: 'SystemPeople', toField: 'user_id' },
  { from: 'Opportunities', fromField: 'account_id', to: 'Accounts', toField: 'account_id' },
  { from: 'Accounts', fromField: 'owner_user_id', to: 'SystemPeople', toField: 'user_id' },

  // System Map relations (cross-references between System entities)
  { from: 'SystemSegments', fromField: 'owner_person_id', to: 'SystemPeople', toField: 'user_id' },
  { from: 'SystemSegments', fromField: 'bu_id', to: 'SystemBusinessUnits', toField: 'bu_id' },
  { from: 'SystemSegments', fromField: 'served_by_flywheels_ids', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'SystemFlywheels', fromField: 'owner_person', to: 'SystemPeople', toField: 'user_id' },
  { from: 'SystemFlywheels', fromField: 'serves_segments', to: 'SystemSegments', toField: 'segment_id' },
  { from: 'SystemFlywheels', fromField: 'serves_bus', to: 'SystemBusinessUnits', toField: 'bu_id' },
  { from: 'SystemBusinessUnits', fromField: 'owner_person_id', to: 'SystemPeople', toField: 'user_id' },
  { from: 'SystemBusinessUnits', fromField: 'primary_flywheel_id', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'SystemBusinessUnits', fromField: 'serves_segments_ids', to: 'SystemSegments', toField: 'segment_id' },
  { from: 'SystemChannels', fromField: 'responsible_person', to: 'SystemPeople', toField: 'user_id' },
  { from: 'SystemChannels', fromField: 'serves_flywheels', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'SystemChannels', fromField: 'serves_bus', to: 'SystemBusinessUnits', toField: 'bu_id' },
  { from: 'SystemInterfaces', fromField: 'responsible_person', to: 'SystemPeople', toField: 'user_id' },
  { from: 'SystemInterfaces', fromField: 'owned_by_hub', to: 'SystemHubs', toField: 'hub_id' },
  { from: 'SystemHubs', fromField: 'owner_person', to: 'SystemPeople', toField: 'user_id' },
  { from: 'SystemHubs', fromField: 'interfaces_owned', to: 'SystemInterfaces', toField: 'interface_id' },
  { from: 'SystemHubs', fromField: 'channels_owned', to: 'SystemChannels', toField: 'channel_id' },
  { from: 'SystemPeople', fromField: 'primary_hub', to: 'SystemHubs', toField: 'hub_id' },
  { from: 'SystemPeople', fromField: 'owns_business_units_ids', to: 'SystemBusinessUnits', toField: 'bu_id' },
  { from: 'SystemPeople', fromField: 'owns_channels_ids', to: 'SystemChannels', toField: 'channel_id' },
  { from: 'SystemPeople', fromField: 'owns_flywheels_ids', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'SystemPeople', fromField: 'owns_interfaces_ids', to: 'SystemInterfaces', toField: 'interface_id' },
  { from: 'SystemPeople', fromField: 'owns_platforms_ids', to: 'SystemPlatforms', toField: 'platform_id' },
  { from: 'SystemPeople', fromField: 'owns_segments_ids', to: 'SystemSegments', toField: 'segment_id' },
  { from: 'SystemPeople', fromField: 'owns_stages_ids', to: 'SystemStages', toField: 'stage_id' },
  { from: 'SystemPeople', fromField: 'owns_touchpoints_ids', to: 'SystemTouchpoints', toField: 'touchpoint_id' },
  { from: 'SystemStages', fromField: 'flywheel', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'SystemTouchpoints', fromField: 'stage_id', to: 'SystemStages', toField: 'stage_id' },
  { from: 'SystemTouchpoints', fromField: 'flywheel_id', to: 'SystemFlywheels', toField: 'flywheel_id' },
  { from: 'SystemTouchpoints', fromField: 'channel_id', to: 'SystemChannels', toField: 'channel_id' },
  { from: 'SystemTouchpoints', fromField: 'interface_id', to: 'SystemInterfaces', toField: 'interface_id' },
  { from: 'SystemTouchpoints', fromField: 'responsible_hub_id', to: 'SystemHubs', toField: 'hub_id' },
  { from: 'SystemTouchpoints', fromField: 'responsible_person_id', to: 'SystemPeople', toField: 'user_id' },

  // Positioning page relations
  { from: 'FlywheelStrategies', fromField: 'servesSegments', to: 'SegmentPositionings', toField: 'segment' },
  { from: 'FunnelStages', fromField: 'flywheelId', to: 'FlywheelStrategies', toField: 'flywheelId' },
  { from: 'FunnelStages', fromField: 'hubName', to: 'SystemHubs', toField: 'hub_name' }, // NOTE: hubName/ownerName are display names
  { from: 'FunnelStages', fromField: 'ownerName', to: 'SystemPeople', toField: 'full_name' }, // NOTE: ownerName is display name
  { from: 'InterfaceMaps', fromField: 'interfaceId', to: 'SystemInterfaces', toField: 'interface_id' },
  { from: 'InterfaceMaps', fromField: 'channelId', to: 'SystemChannels', toField: 'channel_id' },
  { from: 'InterfaceMaps', fromField: 'hubName', to: 'SystemHubs', toField: 'hub_name' },
  { from: 'InterfaceMaps', fromField: 'ownerName', to: 'SystemPeople', toField: 'full_name' },
];