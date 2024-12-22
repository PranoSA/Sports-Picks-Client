"use strict";
/**
 *
 * React Query for years
 *
 *
 * key: 'years'
 *
 *
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useDeleteYear = exports.useAddYear = exports.useGetYears = void 0;
var react_query_1 = require("@tanstack/react-query");
var queryclient_1 = require("./queryclient");
var getToken = function () {
    return localStorage.getItem('accessToken');
};
function useGetYears() {
    var _this = this;
    return react_query_1.useQuery({
        queryKey: ['years'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var new_years;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchYears()];
                    case 1:
                        new_years = _a.sent();
                        return [2 /*return*/, new_years];
                }
            });
        }); }
    });
}
exports.useGetYears = useGetYears;
var fetchYears = function () { return __awaiter(void 0, void 0, Promise, function () {
    var url, res, years_with_string_dates, years;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/years";
                return [4 /*yield*/, fetch(url, {
                        headers: {
                            Authorization: "Bearer " + getToken()
                        }
                    })];
            case 1:
                res = _a.sent();
                // if the response is not ok, throw an error
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                years_with_string_dates = (_a.sent());
                years = years_with_string_dates.map(function (year) {
                    return __assign(__assign({}, year), { start_date: new Date(year.start_date), end_date: new Date(year.end_date) });
                });
                return [2 /*return*/, years];
        }
    });
}); };
var addYears = function (years) { return __awaiter(void 0, void 0, Promise, function () {
    var url, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/years";
                return [4 /*yield*/, fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + getToken()
                        },
                        body: JSON.stringify(years)
                    })];
            case 1:
                res = _a.sent();
                // if the response is not ok, throw an error
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return [2 /*return*/, res.json()];
        }
    });
}); };
// now -> mutation to add a year
function useAddYear() {
    var _this = this;
    return react_query_1.useMutation({
        mutationFn: function (years) {
            var new_year = addYears(years);
            return new_year;
        },
        // on success, update the "years" query-> but don't fetch again
        onSuccess: function (newYear) { return __awaiter(_this, void 0, void 0, function () {
            var added_year, old_years;
            return __generator(this, function (_a) {
                added_year = newYear;
                old_years = queryclient_1["default"].getQueryData(['years']);
                queryclient_1["default"].setQueryData(['years'], __spreadArrays(old_years, added_year));
                return [2 /*return*/];
            });
        }); }
    });
}
exports.useAddYear = useAddYear;
// Delete a year {year_id}
var deleteYear = function (year_id) { return __awaiter(void 0, void 0, Promise, function () {
    var url, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/years/" + year_id;
                return [4 /*yield*/, fetch(url, {
                        method: 'DELETE',
                        Authorization: "Bearer " + getToken()
                    })];
            case 1:
                res = _a.sent();
                // if the response is not ok, throw an error
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return [2 /*return*/, res.json()];
        }
    });
}); };
// now -> mutation to delete a year
function useDeleteYear() {
    var _this = this;
    return react_query_1.useMutation({
        mutationFn: function (year_id) { return __awaiter(_this, void 0, void 0, function () {
            var deleted_year;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, deleteYear(year_id)];
                    case 1:
                        deleted_year = _a.sent();
                        return [2 /*return*/, deleted_year];
                }
            });
        }); },
        // on success, update the "years" query-> but don't fetch again
        onSuccess: function (deleted_year) { return __awaiter(_this, void 0, void 0, function () {
            var old_years;
            return __generator(this, function (_a) {
                old_years = queryclient_1["default"].getQueryData(['years']);
                queryclient_1["default"].setQueryData(['years'], old_years.filter(function (year) { return year.year_id !== deleted_year.year_id; }));
                return [2 /*return*/];
            });
        }); }
    });
}
exports.useDeleteYear = useDeleteYear;
