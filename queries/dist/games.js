"use strict";
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
exports.useGetCurrentWeekGames = exports.useDeleteGame = exports.useAddGames = exports.useGetGames = void 0;
var react_query_1 = require("@tanstack/react-query");
var queryclient_1 = require("./queryclient");
/**
 *
 * Another TRIO of the ADMIN level queries
 *
 *
 */
//you fetch games by [year_id, week_id]
var create_game_key = function (year_id, week_id) { return [
    'games',
    year_id,
    week_id,
]; };
var getGames = function (year_id, week_id) { return __awaiter(void 0, void 0, void 0, function () {
    var url, res, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/games/" + year_id + "/" + week_id;
                return [4 /*yield*/, fetch(url)];
            case 1:
                res = _a.sent();
                if (!res.ok) {
                    throw new Error('Network response was not okay');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                data = _a.sent();
                return [2 /*return*/, data.map(function (game) {
                        return __assign(__assign({}, game), { kickoff: new Date(game.kickoff) });
                    })];
        }
    });
}); };
//use Query
exports.useGetGames = function (year_id, week_id) {
    return react_query_1.useQuery({
        queryKey: create_game_key(year_id, week_id),
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var new_games;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getGames(year_id, week_id)];
                    case 1:
                        new_games = _a.sent();
                        return [2 /*return*/, new_games];
                }
            });
        }); }
    });
};
var addGames = function (games) { return __awaiter(void 0, void 0, void 0, function () {
    var url, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/games";
                return [4 /*yield*/, fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(games)
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
exports.useAddGames = function () {
    return react_query_1.useMutation({
        mutationFn: function (games) { return __awaiter(void 0, void 0, void 0, function () {
            var new_games;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, addGames(games)];
                    case 1:
                        new_games = _a.sent();
                        return [2 /*return*/, games];
                }
            });
        }); },
        onSuccess: function (newGames) {
            var old_games = queryclient_1["default"].getQueryData(create_game_key(newGames[0].year_id, newGames[0].week_id));
            if (!old_games) {
                return;
            }
            var games_now = __spreadArrays(old_games, newGames);
            queryclient_1["default"].setQueryData(create_game_key(newGames[0].year_id, newGames[0].week_id), games_now);
        }
    });
};
//delete games by game_id
var deleteGame = function (game_id) { return __awaiter(void 0, void 0, void 0, function () {
    var url, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/games/" + game_id;
                return [4 /*yield*/, fetch(url, {
                        method: 'DELETE'
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
exports.useDeleteGame = function () {
    return react_query_1.useMutation({
        mutationFn: function (game_id) { return __awaiter(void 0, void 0, void 0, function () {
            var deleted_game;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, deleteGame(game_id)];
                    case 1:
                        deleted_game = _a.sent();
                        return [2 /*return*/, deleted_game];
                }
            });
        }); },
        onSuccess: function (deletedGame) {
            var old_games = queryclient_1["default"].getQueryData(create_game_key(deletedGame.year_id, deletedGame.week_id));
            if (!old_games) {
                return;
            }
            var games_now = old_games.filter(function (game) { return game.game_id !== deletedGame.game_id; });
            queryclient_1["default"].setQueryData(create_game_key(deletedGame.year_id, deletedGame.week_id), games_now);
        }
    });
};
var getCurrentWeekGames = function () { return __awaiter(void 0, void 0, void 0, function () {
    var url, res, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = process.env.NEXT_PUBLIC_API_URL + "/games/current";
                return [4 /*yield*/, fetch(url)];
            case 1:
                res = _a.sent();
                if (!res.ok) {
                    throw new Error('Network response was not okay');
                }
                return [4 /*yield*/, res.json()];
            case 2:
                data = _a.sent();
                return [2 /*return*/, data.map(function (game) {
                        return __assign(__assign({}, game), { kickoff: new Date(game.kickoff) });
                    })];
        }
    });
}); };
exports.useGetCurrentWeekGames = function () {
    return react_query_1.useQuery({
        queryKey: ['current_week_games'],
        queryFn: getCurrentWeekGames
    });
};
