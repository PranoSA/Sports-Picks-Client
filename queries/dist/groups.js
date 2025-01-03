"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.useGetGroupById = exports.useCreateGroup = exports.useGetGroups = void 0;
var react_query_1 = require("@tanstack/react-query");
/**
 *
 * Create Groups
 *
 *This will have stuff for creating groups
 Editing Groups, Deleting Groups


 Inviting Users To Groups,
 Modifying User Roles in Groups
 *
 */
// fetch the groups you belong to
var getGroups = function () { return __awaiter(void 0, void 0, void 0, function () {
    var url, res, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/groups";
                return [4 /*yield*/, fetch(url)];
            case 1:
                res = _a.sent();
                if (!res.ok) {
                    throw new Error('Network response was not okay');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                data = _a.sent();
                return [2 /*return*/, data];
        }
    });
}); };
exports.useGetGroups = function () {
    return react_query_1.useQuery({
        queryKey: ['groups'],
        queryFn: getGroups
    });
};
//  create a group
var createGroup = function (group) { return __awaiter(void 0, void 0, void 0, function () {
    var url, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/groups";
                return [4 /*yield*/, fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(group)
                    })];
            case 1:
                res = _a.sent();
                if (!res.ok) {
                    throw new Error('Network response was not okay');
                }
                return [2 /*return*/, res.json()];
        }
    });
}); };
exports.useCreateGroup = function () {
    return react_query_1.useMutation({
        mutationFn: createGroup,
        onSuccess: function () { }
    });
};
var getGroupById = function (group_id) { return __awaiter(void 0, void 0, Promise, function () {
    var url, res, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/groups/" + group_id;
                return [4 /*yield*/, fetch(url)];
            case 1:
                res = _a.sent();
                if (!res.ok) {
                    throw new Error('Network response was not okay');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                data = _a.sent();
                return [2 /*return*/, data];
        }
    });
}); };
exports.useGetGroupById = function (group_id) {
    return react_query_1.useQuery({
        queryKey: ['group', group_id],
        queryFn: function () { return getGroupById(group_id); }
    });
};
// edit a group
// delete a group
// invite users to a group
// accept an invite to a group
//decline an invite to a group
// leave a group
