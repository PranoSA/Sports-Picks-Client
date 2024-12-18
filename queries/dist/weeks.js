"use strict";
/**
 *
 * Bulk Add Weeks
 */
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
exports.useGetWeeksForCurrentYear = exports.useDeleteWeek = exports.useGetWeeks = exports.useAddWeeks = void 0;
var react_query_1 = require("@tanstack/react-query");
var queryclient_1 = require("./queryclient");
var getKey = function (year_id) { return ['weeks', year_id]; };
var getToken = function () {
    return localStorage.getItem('accessToken');
};
var AddWeeks = function (weeks) { return __awaiter(void 0, void 0, void 0, function () {
    var url, res, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/weeks";
                console.log('weeks', weeks);
                return [4 /*yield*/, fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + getToken()
                        },
                        body: JSON.stringify(weeks)
                    })];
            case 1:
                res = _a.sent();
                // if the response is not ok, throw an error
                if (!res.ok) {
                    throw new Error('Network response was not okay');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                data = _a.sent();
                console.log('data add', data);
                return [2 /*return*/, data];
        }
    });
}); };
function useAddWeeks() {
    var _this = this;
    return react_query_1.useMutation({
        mutationFn: function (weeks) { return __awaiter(_this, void 0, void 0, function () {
            var new_weeks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AddWeeks(weeks)];
                    case 1:
                        new_weeks = _a.sent();
                        return [2 /*return*/, weeks];
                }
            });
        }); },
        onSuccess: function (newWeeks) {
            // key i
            var old_weeks = queryclient_1["default"].getQueryData(getKey(newWeeks[0].year_id));
            if (!old_weeks) {
                return;
            }
            var weeks_now = __spreadArrays(old_weeks, newWeeks);
            queryclient_1["default"].setQueryData(getKey(newWeeks[0].year_id), weeks_now);
        }
    });
}
exports.useAddWeeks = useAddWeeks;
var getWeeks = function (year_id) { return __awaiter(void 0, void 0, void 0, function () {
    var url, res, data, weeks;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/weeks/" + year_id;
                return [4 /*yield*/, fetch(url, {
                        headers: {
                            Authorization: "Bearer " + getToken()
                        }
                    })];
            case 1:
                res = _a.sent();
                if (!res.ok) {
                    throw new Error('Network response was not okay');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                data = _a.sent();
                console.log('dat retreeve', data);
                weeks = data.map(function (week) {
                    return {
                        week_id: week.week_id,
                        year_id: week.year_id,
                        week_name: week.week_name,
                        start_date: new Date(week.start_date),
                        end_date: new Date(week.end_date)
                    };
                });
                return [2 /*return*/, weeks];
        }
    });
}); };
function useGetWeeks(year_id) {
    return react_query_1.useQuery({
        queryKey: getKey(year_id),
        queryFn: function () { return getWeeks(year_id); }
    });
}
exports.useGetWeeks = useGetWeeks;
var deleteWeek = function (week_id, year_id) { return __awaiter(void 0, void 0, void 0, function () {
    var url, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/weeks/" + week_id + "/" + year_id;
                console.log('Year ID DElete', year_id);
                return [4 /*yield*/, fetch(url, {
                        method: 'DELETE'
                    })];
            case 1:
                res = _a.sent();
                if (!res.ok) {
                    console.log('res week not okay', res);
                    throw new Error('Network response was not okay');
                }
                return [2 /*return*/, {
                        week_id: week_id,
                        year_id: year_id
                    }];
        }
    });
}); };
function useDeleteWeek() {
    var _this = this;
    return react_query_1.useMutation({
        mutationFn: function (_a) {
            var week_id = _a.week_id, year_id = _a.year_id;
            return __awaiter(_this, void 0, void 0, function () {
                var deletedWeek;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, deleteWeek(week_id, year_id)];
                        case 1:
                            deletedWeek = _b.sent();
                            console.log('deletedWeek', deletedWeek);
                            return [2 /*return*/, {
                                    week_id: week_id,
                                    year_id: year_id
                                }];
                    }
                });
            });
        },
        onSuccess: function (deletedWeek) {
            console.log('Succesfully Deleted Week', deletedWeek);
            var weeks = queryclient_1["default"].getQueryData(getKey(deletedWeek.year_id));
            console.log('weeks', weeks);
            if (!weeks) {
                return;
            }
            var newWeeks = weeks.filter(function (week) { return week.week_id !== deletedWeek.week_id; });
            console.log('newWeeks', newWeeks);
            console.log('deletedWeek.year_id', deletedWeek.year_id);
            console.log('weeks', weeks);
            queryclient_1["default"].setQueryData(getKey(deletedWeek.year_id), newWeeks);
        }
    });
}
exports.useDeleteWeek = useDeleteWeek;
var getWeeksForCurrentYear = function () { return __awaiter(void 0, void 0, void 0, function () {
    var url, res, data, weeks;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/weeks/current_year";
                return [4 /*yield*/, fetch(url, {
                        headers: {
                            Authorization: "Bearer " + getToken()
                        }
                    })];
            case 1:
                res = _a.sent();
                if (!res.ok) {
                    throw new Error('Network response was not okay');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                data = (_a.sent());
                console.log('data', data);
                weeks = data.map(function (week) {
                    return {
                        week_id: week.week_id,
                        year_id: week.year_id,
                        week_name: week.week_name,
                        start_date: new Date(week.start_date),
                        end_date: new Date(week.end_date)
                    };
                });
                console.log('weeks', weeks);
                return [2 /*return*/, weeks];
        }
    });
}); };
function useGetWeeksForCurrentYear() {
    return react_query_1.useQuery({
        queryKey: ['weeks', 'current_year'],
        queryFn: getWeeksForCurrentYear
    });
}
exports.useGetWeeksForCurrentYear = useGetWeeksForCurrentYear;
