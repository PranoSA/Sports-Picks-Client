/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 *
 * This is the page for creating a group.
 * You will fill out a form with
 *
 * 1. Group Name
 * 2. List of Bets
 *
 */
'use client';
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var groups_1 = require("@/queries/groups");
function CreateGroupPage() {
    var _a = react_1.useState(''), groupName = _a[0], setGroupName = _a[1];
    var _b = react_1.useState([]), bets = _b[0], setBets = _b[1];
    var _c = react_1.useState(''), betsError = _c[0], setBetsError = _c[1];
    var _d = react_1.useState(''), groupNameError = _d[0], setGroupNameError = _d[1];
    var _e = react_1.useState(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    var _f = react_1.useState(0), numPoints = _f[0], setNumPoints = _f[1];
    var _g = react_1.useState(null), pointsError = _g[0], setPointsError = _g[1];
    var _h = react_1.useState('spread'), type = _h[0], setType = _h[1];
    var createGroup = groups_1.useCreateGroup();
    react_1.useEffect(function () {
        if (isSubmitting) {
            if (groupName && bets.length) {
                console.log('Submit form');
            }
            setIsSubmitting(false);
        }
    }, [isSubmitting]);
    var addBet = function () {
        if (numPoints < 1 || numPoints > 10) {
            setPointsError('Number of points must be between 1 and 10');
            return;
        }
        var new_bet = { type: type, num_points: numPoints };
        var new_bets = __spreadArrays(bets, [new_bet]);
        setBets(new_bets);
        setPointsError(null);
        setNumPoints(1);
    };
    var removeBet = function (index) {
        setBets(function (prevBets) { return prevBets.filter(function (_, i) { return i !== index; }); });
    };
    var handleFormSubmit = function (e) {
        e.preventDefault();
        setGroupNameError('');
        setBetsError('');
        if (!groupName) {
            setGroupNameError('Group Name is required');
        }
        if (!bets.length) {
            setBetsError('At least one bet is required');
        }
        setIsSubmitting(true);
        // createGroup.mutate({ name: groupName, bets: bets });
    };
    var submitGroup = function () {
        if (groupName && bets.length) {
            createGroup.mutate({ name: groupName, bets: bets });
        }
    };
    return (React.createElement("div", { className: "p-4 flex flex-col items-center" },
        React.createElement("h1", { className: "text-2xl font-semibold mt-8" }, "Create Group"),
        React.createElement("form", { onSubmit: handleFormSubmit, className: "mt-4 w-full max-w-lg" },
            React.createElement("div", { className: "flex flex-col gap-4" },
                React.createElement("div", { className: "flex flex-col sm:flex-row gap-4" },
                    React.createElement("div", { className: "flex flex-col gap-2 w-full" },
                        React.createElement("label", { htmlFor: "groupName", className: "text-sm font-semibold" }, "Group Name"),
                        React.createElement("input", { type: "text", id: "groupName", value: groupName, onChange: function (e) { return setGroupName(e.target.value); }, className: "p-2 border rounded dark:bg-gray-800 dark:text-gray-200" }),
                        groupNameError && (React.createElement("span", { className: "text-red-500 text-sm" }, groupNameError)))),
                React.createElement("div", { className: "flex flex-col gap-2 w-full" },
                    React.createElement("label", { htmlFor: "type", className: "text-sm font-semibold" }, "Type"),
                    React.createElement("select", { id: "type", value: type, onChange: function (e) {
                            return setType(e.target.value);
                        }, className: "p-2 border rounded dark:bg-gray-800 dark:text-gray-200" },
                        React.createElement("option", { value: "spread" }, "Spread"),
                        React.createElement("option", { value: "over_under" }, "Over/Under"),
                        React.createElement("option", { value: "moneyline" }, "Moneyline"))),
                React.createElement("div", { className: "flex flex-col gap-2 w-full" },
                    React.createElement("label", { htmlFor: "numPoints", className: "text-sm font-semibold" }, "Number of Points"),
                    React.createElement("input", { type: "number", id: "numPoints", step: 1, min: 1, max: 10, value: numPoints, onChange: function (e) { return setNumPoints(parseInt(e.target.value)); }, className: "p-2 border rounded dark:bg-gray-800 dark:text-gray-200" }),
                    pointsError && (React.createElement("span", { className: "text-red-500 text-sm" }, pointsError))),
                React.createElement("button", { type: "button", onClick: addBet, className: "p-2 bg-green-500 text-white rounded" }, "Add Bet")),
            betsError && React.createElement("span", { className: "text-red-500 text-sm" }, betsError),
            React.createElement("ul", { className: "mt-4 space-y-2" }, bets.map(function (bet, index) { return (React.createElement("li", { key: index, className: "flex items-center gap-4 p-2 border rounded bg-white dark:bg-gray-800 dark:text-gray-200" },
                React.createElement("span", null, bet.type),
                React.createElement("span", null, bet.num_points),
                React.createElement("button", { type: "button", onClick: function () { return removeBet(index); }, className: "text-red-500" }, "Remove"))); })),
            React.createElement("button", { type: "submit", className: "p-2 bg-blue-500 text-white rounded mt-4" }, "Create Group"))));
}
exports["default"] = CreateGroupPage;
