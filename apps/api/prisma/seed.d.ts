import 'dotenv/config';
export declare const DEFAULT_STATUSES: readonly [{
    readonly title: "Open";
    readonly sortOrder: 0;
}, {
    readonly title: "In Progress";
    readonly sortOrder: 1;
}, {
    readonly title: "Done";
    readonly sortOrder: 2;
}];
export declare const ORG_SCOPED_RESOURCES: readonly ["USER", "PROJECT"];
export declare const PROJECT_SCOPED_RESOURCES: readonly ["ISSUE", "COMMENT", "ISSUE_MEDIA"];
