/**
 *
 *
 * This page you add seasons
 *
 * Just have it be a form that takes in the year
 * then makes the season
 * that year - year + 1
 */
'use client';
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
var react_1 = require("react");
var queryclient_1 = require("@/queries/queryclient");
var react_query_1 = require("@tanstack/react-query");
var years_1 = require("@/queries/years");
var link_1 = require("next/link");
var fa_1 = require("react-icons/fa");
var PageWithQuery = function () {
    //wraps Page component with useQuery
    return (React.createElement(react_query_1.QueryClientProvider, { client: queryclient_1["default"] },
        React.createElement(Page, null)));
};
var Page = function () {
    var _a = react_1.useState(''), year = _a[0], setYear = _a[1];
    var _b = react_1.useState(new Date()), startDate = _b[0], setStartDate = _b[1];
    var _c = react_1.useState(new Date()), endDate = _c[0], setEndDate = _c[1];
    var _d = years_1.useGetYears(), years = _d.data, isLoading = _d.isLoading, isError = _d.isError, error = _d.error;
    var _e = react_1.useState([]), yearsToAdd = _e[0], setYearsToAdd = _e[1];
    var _f = react_1.useState(1), repeatAmount = _f[0], setRepeatAmount = _f[1];
    var addYear = years_1.useAddYear();
    //set to dark mode
    react_1.useEffect(function () {
        document.body.classList.add('dark');
    }, []);
    var checkNoYearInterferesWithNewYear = function () {
        //check every
        if (!years)
            return { interferes: true, interfering_year: null };
        //now check every year
        for (var _i = 0, years_2 = years; _i < years_2.length; _i++) {
            var year_1 = years_2[_i];
            if (year_1.start_date <= startDate && year_1.end_date >= startDate) {
                return {
                    interferes: true,
                    interfering_year: year_1
                };
            }
            if (year_1.start_date <= endDate && year_1.end_date >= endDate) {
                return {
                    interferes: true,
                    interfering_year: year_1
                };
            }
        }
        return {
            interferes: false,
            interfering_year: null
        };
    };
    var insertYearsWithRepeat = function () {
        // take the year and repeat ammount
        // loop through the repeat amount, incrementing the start_date and end_date by 1 year each time
        // name each year the Year - Year + 1 value of the start_date
        // add the year to the yearsToAdd array
        var last_start_date = new Date(startDate);
        var last_end_date = new Date(endDate);
        var yearsToAdd = [];
        for (var i = 0; i < repeatAmount; i++) {
            var new_year = {
                year_id: last_start_date.getFullYear() + "-" + last_end_date.getFullYear(),
                start_date: new Date(last_start_date),
                end_date: new Date(last_end_date)
            };
            yearsToAdd.push(new_year);
            last_start_date.setFullYear(last_start_date.getFullYear() + 1);
            last_end_date.setFullYear(last_end_date.getFullYear() + 1);
        }
        return yearsToAdd;
    };
    //submit years to add
    var submitYears = function () { return __awaiter(void 0, void 0, void 0, function () {
        var yearsToAdd, _i, yearsToAdd_1, year_2, _a, interferes, interfering_year;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    yearsToAdd = insertYearsWithRepeat();
                    //check if any years interfere with the new years
                    for (_i = 0, yearsToAdd_1 = yearsToAdd; _i < yearsToAdd_1.length; _i++) {
                        year_2 = yearsToAdd_1[_i];
                        _a = checkNoYearInterferesWithNewYear(), interferes = _a.interferes, interfering_year = _a.interfering_year;
                        if (interferes) {
                            console.log('interferes with year:', interfering_year);
                            alert('Interferes with year: ' + (interfering_year === null || interfering_year === void 0 ? void 0 : interfering_year.year_id));
                            return [2 /*return*/];
                        }
                    }
                    //console.log(yearsToAdd);
                    return [4 /*yield*/, addYear.mutateAsync(yearsToAdd)];
                case 1:
                    //console.log(yearsToAdd);
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var formatDate = function (date) {
        return date.toISOString().split('T')[0];
    };
    return (React.createElement("div", { className: "flex flex-col items-center p-4" },
        React.createElement("h1", { className: "text-2xl font-bold mb-4" }, "Add Season"),
        React.createElement("form", { onSubmit: function (e) {
                e.preventDefault();
                submitYears();
            }, className: "flex flex-col gap-4 w-full max-w-md" },
            React.createElement("input", { type: "text", value: year, onChange: function (e) { return setYear(e.target.value); }, placeholder: "Year", className: "p-2 border rounded dark:bg-gray-800 dark:text-gray-200" }),
            React.createElement("div", { className: "flex gap-4" },
                React.createElement("div", { className: "flex flex-col w-1/2" },
                    React.createElement("label", { className: "mb-2" }, "Start Date"),
                    React.createElement("input", { type: "date", value: formatDate(startDate), onChange: function (e) { return setStartDate(new Date(e.target.value)); }, className: "p-2 border rounded dark:bg-gray-800 dark:text-gray-200" })),
                React.createElement("div", { className: "flex flex-col w-1/2" },
                    React.createElement("label", { className: "mb-2" }, "End Date"),
                    React.createElement("input", { type: "date", value: formatDate(endDate), onChange: function (e) { return setEndDate(new Date(e.target.value)); }, className: "p-2 border rounded dark:bg-gray-800 dark:text-gray-200" }))),
            React.createElement("input", { type: "number", value: repeatAmount, onChange: function (e) { return setRepeatAmount(parseInt(e.target.value)); }, placeholder: "Repeat Amount", className: "p-2 border rounded dark:bg-gray-800 dark:text-gray-200" }),
            React.createElement("button", { type: "submit", className: "p-2 bg-blue-500 text-white rounded" }, "Add")),
        React.createElement("div", { className: "mt-8 w-full max-w-md" },
            React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "List of Seasons"),
            React.createElement(ListOfYears, null))));
};
var ListOfYears = function () {
    var _a = years_1.useGetYears(), years = _a.data, isLoading = _a.isLoading, isError = _a.isError, error = _a.error;
    var deleteYear = years_1.useDeleteYear();
    var handleDelete = function (year_id) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, deleteYear.mutateAsync(year_id)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    //
    if (isLoading) {
        return React.createElement("div", null, "Loading...");
    }
    if (isError) {
        return React.createElement("div", null,
            "Error: ",
            error.stack);
    }
    if (!years) {
        return React.createElement("div", null, "No years found");
    }
    var current_year = years.find(function (year) {
        var current_date = new Date();
        return (new Date(year.start_date) <= current_date &&
            new Date(year.end_date) >= current_date);
    });
    return (React.createElement("div", { className: "space-y-4" }, years.map(function (year) { return (React.createElement("div", { key: year.year_id, className: "p-4 border-4  rounded dark:bg-gray-800 dark:text-gray-200  " + ((current_year === null || current_year === void 0 ? void 0 : current_year.year_id) === year.year_id
            ? 'border-neonGreen'
            : 'border-gray-500') },
        React.createElement("h2", { className: "text-lg font-semibold" }, year.year_id),
        React.createElement("p", null,
            ' ',
            year.start_date.toDateString(),
            " - ",
            year.end_date.toDateString()),
        React.createElement("div", { className: "flex flex-row justify-around" },
            React.createElement("div", { className: "flex flex-row space-y-2 p-2 cursor-pointer dark:text-red", onClick: function () { return handleDelete(year.year_id); } },
                React.createElement(fa_1.FaTrash, { className: "mr-2 dark:text-red-700" }),
                React.createElement("h2", { className: "dark:text-red-700" }, " Delete Year ")),
            React.createElement(link_1["default"], { href: "/admin/year/" + year.year_id },
                React.createElement("button", { className: "p-2 text-white rounded dark:text-neonPurple" },
                    React.createElement("p", { className: "dark:text-neonPurple text-neonPink" },
                        ' ',
                        "Visit Year",
                        ' ')))))); })));
};
exports["default"] = PageWithQuery;
