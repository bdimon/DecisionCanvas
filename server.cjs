var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/data/fallbackGenerator.ts
function extractProfile(text) {
  const t = text.toLowerCase();
  const isStability = /(стабильн|сохран|остать|надежн|корпорац|текущ|привычн|безопасн|медленн|постоянн|гаранти|штат|stay|keep|stable|enterprise|corporate|current|safe|familiar|in-house|steady)/i.test(t);
  const isGrowth = /(стартап|перейт|нов|бизнес|свой|венчур|фриланс|рискнуть|прорыв|масштаб|смен|startup|switch|join|new|business|venture|freelance|breakthrough|pivot|growth|risk)/i.test(t);
  const isHighCapital = /(купить|покупка|ипотек|собственн|автомобиль|машин|квартир|новостройк|приобрести|buy|purchase|mortgage|own vehicle|own car|apartment|acquire)/i.test(t);
  const isLeanVariable = /(аренд|снимать|каршеринг|такси|общественн|онлайн|практик|подписк|инвестир|rent|lease|car-share|ride-hail|transit|online|subscription|on-demand|invest)/i.test(t);
  const isComplexArch = /(микросервис|оркестрац|kubernetes|k8s|распределен|сервис-ориентир|microservice|distributed|cluster)/i.test(t);
  const isSimpleArch = /(монолит|модульн|единая кодовая|monolith|modular)/i.test(t);
  return {
    title: text,
    isStability,
    isGrowth,
    isHighCapital,
    isLeanVariable,
    isComplexArch,
    isSimpleArch
  };
}
function extractContext(contextText) {
  if (!contextText || !contextText.trim()) {
    return {
      prioritizesSafety: false,
      prioritizesGrowth: false,
      resourceConstrained: false,
      urbanTransitFriendly: false
    };
  }
  const c = contextText.toLowerCase();
  const hasExplicitNoCommitments = /(нет|без|свободен от|не имею)\s+([а-яё\s]*)(обязательств|долг|кредит|детей)|(no\s+(commitments|debt|children|family commitments))/i.test(c);
  let prioritizesSafety = /(семья|дети|ребенок|кредит|ипотек|предсказуем|безопасн|подушк|стабильн|надежн|риск нежелателен|консервативн|гаранти|family|children|kid|debt|loan|mortgage|predictab|safety|buffer|runway|security|averse|conservative)/i.test(c);
  if (/(обязательств|commitment)/i.test(c) && !hasExplicitNoCommitments) {
    prioritizesSafety = true;
  }
  const prioritizesGrowth = /(рост|масштаб|прорыв|амбиц|максимум|карьер|высокий доход|готов к риску|аппетит к риску|рискован|экспанси|growth|scale|breakthrough|ambition|career|high yield|risk tolerant|risk appetite|upside|multiplier)/i.test(c);
  const resourceConstrained = /(мало|небольш|ограничен|6 разработчик|неопределен|ранний этап|старт|бюджет ограничен|сбережен|small team|team of 6|solo|constrained|tight budget|uncertain|early stage|mvp|limited)/i.test(c);
  const urbanTransitFriendly = /(город|инфраструктур|3-4 раза|редк|метро|такси|каршеринг|urban|city|transit|infrastructure|3-4|occasional|metro)/i.test(c);
  return {
    prioritizesSafety,
    prioritizesGrowth,
    resourceConstrained,
    urbanTransitFriendly
  };
}
function generateLocalAnalysis(option1, option2, context, language = "ru") {
  const isEn = language === "en";
  const opt1 = typeof option1 === "string" ? option1.trim() : "";
  const opt2 = typeof option2 === "string" ? option2.trim() : "";
  if (!opt1 || !opt2) {
    throw new Error(
      isEn ? "Both decision options must be non-empty strings. Please specify valid options to compare." : "\u041E\u0431\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u044B. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B \u0434\u043B\u044F \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F."
    );
  }
  const p1 = extractProfile(opt1);
  const p2 = extractProfile(opt2);
  const ctx = extractContext(context);
  let weight1 = 4;
  let score1_crit1 = 7;
  let score2_crit1 = 7;
  let note1_crit1 = isEn ? "Standard entry investment threshold" : "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 \u043F\u043E\u0440\u043E\u0433 \u043F\u0435\u0440\u0432\u043E\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0445 \u0432\u043B\u043E\u0436\u0435\u043D\u0438\u0439";
  let note2_crit1 = isEn ? "Standard entry investment threshold" : "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 \u043F\u043E\u0440\u043E\u0433 \u043F\u0435\u0440\u0432\u043E\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0445 \u0432\u043B\u043E\u0436\u0435\u043D\u0438\u0439";
  if (p1.isHighCapital && !p2.isHighCapital) {
    score1_crit1 = 4;
    score2_crit1 = 8;
    note1_crit1 = isEn ? "Heavy capital outlay or long-term financial commitment" : "\u0421\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u043A\u0430\u043F\u0438\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u0442\u0440\u0430\u0442\u044B \u0438\u043B\u0438 \u0434\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u044B\u0435 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u0430";
    note2_crit1 = isEn ? "Pay-as-you-go model with low entry barrier" : "\u041C\u043E\u0434\u0435\u043B\u044C \u0433\u0438\u0431\u043A\u043E\u0439 \u043E\u043F\u043B\u0430\u0442\u044B \u043F\u043E \u0444\u0430\u043A\u0442\u0443 \u0441 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u043C \u043F\u043E\u0440\u043E\u0433\u043E\u043C \u0432\u0445\u043E\u0434\u0430";
  } else if (!p1.isHighCapital && p2.isHighCapital) {
    score1_crit1 = 8;
    score2_crit1 = 4;
    note1_crit1 = isEn ? "Low entry barrier without tying up liquidity" : "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0440\u043E\u0433 \u0432\u0445\u043E\u0434\u0430 \u0431\u0435\u0437 \u0437\u0430\u043C\u043E\u0440\u043E\u0437\u043A\u0438 \u043B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u0438";
    note2_crit1 = isEn ? "Heavy capital outlay and high initial investment threshold" : "\u0421\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u043F\u0435\u0440\u0432\u043E\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u0442\u0440\u0430\u0442\u044B \u0438 \u043F\u043E\u0440\u043E\u0433 \u0432\u0445\u043E\u0434\u0430";
  } else if (p1.isStability && p2.isGrowth) {
    score1_crit1 = 8;
    score2_crit1 = 5;
    note1_crit1 = isEn ? "Predictable, transparent budgeting within existing bandwidth" : "\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u044B\u0439 \u0431\u044E\u0434\u0436\u0435\u0442 \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0439 \u043F\u043E\u0434\u0443\u0448\u043A\u0438";
    note2_crit1 = isEn ? "High initial investment of hours, focus, and adaptation effort" : "\u0422\u0440\u0435\u0431\u0443\u044E\u0442\u0441\u044F \u043E\u0449\u0443\u0442\u0438\u043C\u044B\u0435 \u043F\u0435\u0440\u0432\u043E\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0435 \u0438\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u0441\u0438\u043B \u0438 \u0432\u0440\u0435\u043C\u0435\u043D\u0438";
  } else if (p1.isGrowth && p2.isStability) {
    score1_crit1 = 5;
    score2_crit1 = 8;
    note1_crit1 = isEn ? "High upfront investment of focus and transition effort" : "\u0422\u0440\u0435\u0431\u0443\u044E\u0442\u0441\u044F \u043E\u0449\u0443\u0442\u0438\u043C\u044B\u0435 \u043F\u0435\u0440\u0432\u043E\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0435 \u0438\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u0441\u0438\u043B \u0438 \u0432\u0440\u0435\u043C\u0435\u043D\u0438";
    note2_crit1 = isEn ? "Transparent predictable budgeting and lower initial friction" : "\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u044B\u0439 \u0431\u044E\u0434\u0436\u0435\u0442 \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0439 \u043F\u043E\u0434\u0443\u0448\u043A\u0438";
  }
  let weight2 = 4;
  let score1_crit2 = 7;
  let score2_crit2 = 7;
  let note1_crit2 = isEn ? "Moderate downside exposure" : "\u0423\u043C\u0435\u0440\u0435\u043D\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u0440\u0438\u0441\u043A\u0430";
  let note2_crit2 = isEn ? "Moderate downside exposure" : "\u0423\u043C\u0435\u0440\u0435\u043D\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u0440\u0438\u0441\u043A\u0430";
  if (p1.isStability && !p2.isStability) {
    score1_crit2 = 8;
    score2_crit2 = 5;
    note1_crit2 = isEn ? "High downside protection, proven safety margins, smooth reversal" : "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u0443\u0435\u043C\u044B\u0435 \u0440\u0438\u0441\u043A\u0438, \u043D\u0430\u0434\u0435\u0436\u043D\u044B\u0439 \u0442\u044B\u043B, \u0431\u0435\u0437\u0431\u043E\u043B\u0435\u0437\u043D\u0435\u043D\u043D\u044B\u0439 \u043E\u0442\u043A\u0430\u0442";
    note2_crit2 = isEn ? "Higher volatility and elevated sensitivity to early missteps" : "\u041F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u0430\u044F \u043D\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0438 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0442 \u0432\u043D\u0435\u0448\u043D\u0438\u0445 \u0444\u0430\u043A\u0442\u043E\u0440\u043E\u0432";
  } else if (!p1.isStability && p2.isStability) {
    score1_crit2 = 5;
    score2_crit2 = 8;
    note1_crit2 = isEn ? "Higher volatility and sensitivity to early missteps" : "\u041F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u0430\u044F \u043D\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0438 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0442 \u0432\u043D\u0435\u0448\u043D\u0438\u0445 \u0444\u0430\u043A\u0442\u043E\u0440\u043E\u0432";
    note2_crit2 = isEn ? "High downside protection, proven safety margins, smooth reversal" : "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u0443\u0435\u043C\u044B\u0435 \u0440\u0438\u0441\u043A\u0438, \u043D\u0430\u0434\u0435\u0436\u043D\u044B\u0439 \u0442\u044B\u043B, \u0431\u0435\u0437\u0431\u043E\u043B\u0435\u0437\u043D\u0435\u043D\u043D\u044B\u0439 \u043E\u0442\u043A\u0430\u0442";
  } else if (p1.isSimpleArch && p2.isComplexArch) {
    score1_crit2 = 9;
    score2_crit2 = 5;
    note1_crit2 = isEn ? "Single failure domain, rapid debugging, zero network partition risks" : "\u041F\u0440\u043E\u0441\u0442\u043E\u0439 \u0434\u0435\u0431\u0430\u0433, \u0435\u0434\u0438\u043D\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439, \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0442\u043E\u0447\u0435\u043A \u043E\u0442\u043A\u0430\u0437\u0430";
    note2_crit2 = isEn ? "Distributed failures, network latency, high infrastructure complexity" : "\u0420\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u043D\u044B\u0435 \u0441\u0431\u043E\u0438, \u0441\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0430 \u0438 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u043D\u043E\u0441\u0442\u0438";
  } else if (p1.isComplexArch && p2.isSimpleArch) {
    score1_crit2 = 5;
    score2_crit2 = 9;
    note1_crit2 = isEn ? "Distributed failures, network latency, high infrastructure complexity" : "\u0420\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u043D\u044B\u0435 \u0441\u0431\u043E\u0438, \u0441\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0430 \u0438 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u043D\u043E\u0441\u0442\u0438";
    note2_crit2 = isEn ? "Single failure domain, rapid debugging, zero network partition risks" : "\u041F\u0440\u043E\u0441\u0442\u043E\u0439 \u0434\u0435\u0431\u0430\u0433, \u0435\u0434\u0438\u043D\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439, \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0442\u043E\u0447\u0435\u043A \u043E\u0442\u043A\u0430\u0437\u0430";
  }
  let weight3 = 4;
  let score1_crit3 = 7;
  let score2_crit3 = 7;
  let note1_crit3 = isEn ? "Solid sustainable return profile" : "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u0430\u044F \u043E\u0442\u0434\u0430\u0447\u0430 \u0432 \u0440\u0430\u043C\u043A\u0430\u0445 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u043E\u0439 \u0442\u0440\u0430\u0435\u043A\u0442\u043E\u0440\u0438\u0438";
  let note2_crit3 = isEn ? "Solid sustainable return profile" : "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u0430\u044F \u043E\u0442\u0434\u0430\u0447\u0430 \u0432 \u0440\u0430\u043C\u043A\u0430\u0445 \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u043E\u0439 \u0442\u0440\u0430\u0435\u043A\u0442\u043E\u0440\u0438\u0438";
  if (p1.isGrowth && !p2.isGrowth) {
    score1_crit3 = 9;
    score2_crit3 = 5;
    note1_crit3 = isEn ? "Strong asymmetric multiplier and high compounding upside" : "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u043C\u0443\u043B\u044C\u0442\u0438\u043F\u043B\u0438\u043A\u0430\u0442\u043E\u0440 \u043E\u0442\u0434\u0430\u0447\u0438 \u0438 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0440\u044B\u0432\u0430";
    note2_crit3 = isEn ? "Linear, steady increments with a bounded ceiling" : "\u041B\u0438\u043D\u0435\u0439\u043D\u044B\u0439 \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u0438\u0440\u0443\u0435\u043C\u044B\u0439 \u0440\u043E\u0441\u0442 \u0441 \u0443\u043C\u0435\u0440\u0435\u043D\u043D\u044B\u043C \u043F\u043E\u0442\u043E\u043B\u043A\u043E\u043C";
  } else if (!p1.isGrowth && p2.isGrowth) {
    score1_crit3 = 5;
    score2_crit3 = 9;
    note1_crit3 = isEn ? "Linear, steady increments with a bounded ceiling" : "\u041B\u0438\u043D\u0435\u0439\u043D\u044B\u0439 \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u0438\u0440\u0443\u0435\u043C\u044B\u0439 \u0440\u043E\u0441\u0442 \u0441 \u0443\u043C\u0435\u0440\u0435\u043D\u043D\u044B\u043C \u043F\u043E\u0442\u043E\u043B\u043A\u043E\u043C";
    note2_crit3 = isEn ? "Strong asymmetric multiplier and high compounding upside" : "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u043C\u0443\u043B\u044C\u0442\u0438\u043F\u043B\u0438\u043A\u0430\u0442\u043E\u0440 \u043E\u0442\u0434\u0430\u0447\u0438 \u0438 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0440\u044B\u0432\u0430";
  }
  let weight4 = 3;
  let score1_crit4 = 7;
  let score2_crit4 = 7;
  let note1_crit4 = isEn ? "Manageable operational tempo" : "\u0423\u043C\u0435\u0440\u0435\u043D\u043D\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043D\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0433\u0440\u0430\u0444\u0438\u043A";
  let note2_crit4 = isEn ? "Manageable operational tempo" : "\u0423\u043C\u0435\u0440\u0435\u043D\u043D\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043D\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0433\u0440\u0430\u0444\u0438\u043A";
  if ((p1.isStability || p1.isSimpleArch) && (p2.isGrowth || p2.isComplexArch)) {
    score1_crit4 = 8;
    score2_crit4 = 4;
    note1_crit4 = isEn ? "Familiar rhythms with low mental friction and predictable schedules" : "\u041F\u0440\u0438\u0432\u044B\u0447\u043D\u044B\u0439 \u0440\u0438\u0442\u043C, \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0442\u0440\u0435\u0432\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u0438 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441";
    note2_crit4 = isEn ? "Steep learning curve and extended stretch outside comfort zone" : "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u043A\u043E\u0433\u043D\u0438\u0442\u0438\u0432\u043D\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438 \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u0432\u044B\u0445\u043E\u0434 \u0438\u0437 \u0437\u043E\u043D\u044B \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u0430";
  } else if ((p1.isGrowth || p1.isComplexArch) && (p2.isStability || p2.isSimpleArch)) {
    score1_crit4 = 4;
    score2_crit4 = 8;
    note1_crit4 = isEn ? "Steep learning curve and extended stretch outside comfort zone" : "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u043A\u043E\u0433\u043D\u0438\u0442\u0438\u0432\u043D\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438 \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u0432\u044B\u0445\u043E\u0434 \u0438\u0437 \u0437\u043E\u043D\u044B \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u0430";
    note2_crit4 = isEn ? "Familiar rhythms with low mental friction and predictable schedules" : "\u041F\u0440\u0438\u0432\u044B\u0447\u043D\u044B\u0439 \u0440\u0438\u0442\u043C, \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0442\u0440\u0435\u0432\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u0438 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441";
  }
  let weight5 = 3;
  let score1_crit5 = 7;
  let score2_crit5 = 7;
  let note1_crit5 = isEn ? "Balanced degree of operational independence" : "\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0441\u0442\u0435\u043F\u0435\u043D\u044C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0439 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438";
  let note2_crit5 = isEn ? "Balanced degree of operational independence" : "\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0441\u0442\u0435\u043F\u0435\u043D\u044C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0439 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438";
  if (p1.isLeanVariable && p2.isHighCapital) {
    score1_crit5 = 9;
    score2_crit5 = 4;
    note1_crit5 = isEn ? "Ultimate mobility: easily cancel, pause, or switch at any moment" : "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043C\u043E\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C: \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0441\u043C\u0435\u043D\u0438\u0442\u044C \u0438\u043B\u0438 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0432 \u043B\u044E\u0431\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442";
    note2_crit5 = isEn ? "Long-term lock-in with ongoing depreciation, upkeep, and liability" : "\u0414\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u0430\u044F \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430, \u0430\u043C\u043E\u0440\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u0438 \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435";
  } else if (p1.isHighCapital && p2.isLeanVariable) {
    score1_crit5 = 4;
    score2_crit5 = 9;
    note1_crit5 = isEn ? "Long-term lock-in with ongoing depreciation, upkeep, and liability" : "\u0414\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u0430\u044F \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430, \u0430\u043C\u043E\u0440\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u0438 \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435";
    note2_crit5 = isEn ? "Ultimate mobility: easily cancel, pause, or switch at any moment" : "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043C\u043E\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C: \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0441\u043C\u0435\u043D\u0438\u0442\u044C \u0438\u043B\u0438 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0432 \u043B\u044E\u0431\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442";
  } else if (p1.isGrowth && p2.isStability) {
    score1_crit5 = 8;
    score2_crit5 = 6;
    note1_crit5 = isEn ? "Agile decision authority and freedom to pivot fast" : "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0430\u0432\u0442\u043E\u043D\u043E\u043C\u0438\u044F \u0438 \u0441\u0432\u043E\u0431\u043E\u0434\u0430 \u0431\u044B\u0441\u0442\u0440\u043E \u043F\u0435\u0440\u0435\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u044B";
    note2_crit5 = isEn ? "Bound by corporate bureaucracy and multi-layer approval chains" : "\u0421\u0432\u044F\u0437\u0430\u043D\u043D\u043E\u0441\u0442\u044C \u0440\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u0430\u043C\u0438 \u0438 \u043C\u043D\u043E\u0433\u043E\u0443\u0440\u043E\u0432\u043D\u0435\u0432\u044B\u043C\u0438 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u044F\u043C\u0438";
  } else if (p1.isStability && p2.isGrowth) {
    score1_crit5 = 6;
    score2_crit5 = 8;
    note1_crit5 = isEn ? "Bound by established processes and slower approval cadence" : "\u0421\u0432\u044F\u0437\u0430\u043D\u043D\u043E\u0441\u0442\u044C \u0440\u0435\u0433\u043B\u0430\u043C\u0435\u043D\u0442\u0430\u043C\u0438 \u0438 \u043C\u043D\u043E\u0433\u043E\u0443\u0440\u043E\u0432\u043D\u0435\u0432\u044B\u043C\u0438 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u044F\u043C\u0438";
    note2_crit5 = isEn ? "Agile decision authority and freedom to pivot fast" : "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0430\u0432\u0442\u043E\u043D\u043E\u043C\u0438\u044F \u0438 \u0441\u0432\u043E\u0431\u043E\u0434\u0430 \u0431\u044B\u0441\u0442\u0440\u043E \u043F\u0435\u0440\u0435\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u044B";
  }
  if (ctx.prioritizesSafety && !ctx.prioritizesGrowth) {
    weight1 = 5;
    weight2 = 5;
    weight4 = 4;
    weight3 = 3;
    weight5 = 3;
  } else if (ctx.prioritizesGrowth && !ctx.prioritizesSafety) {
    weight3 = 5;
    weight5 = 5;
    weight2 = 2;
    weight4 = 2;
    weight1 = 3;
  } else if (ctx.prioritizesSafety && ctx.prioritizesGrowth) {
    weight1 = 4;
    weight2 = 5;
    weight3 = 4;
    weight4 = 3;
    weight5 = 3;
  }
  if (ctx.resourceConstrained) {
    weight1 = 5;
    weight4 = 4;
  }
  if (ctx.urbanTransitFriendly) {
    weight1 = 5;
    weight5 = 5;
  }
  const comparisonTable = [
    {
      id: "crit-1",
      category: isEn ? "Capital & Resource Barrier" : "\u0424\u0438\u043D\u0430\u043D\u0441\u044B \u0438 \u0437\u0430\u0442\u0440\u0430\u0442\u044B",
      title: isEn ? "Upfront Capital & Resource Threshold" : "\u041F\u0435\u0440\u0432\u043E\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u0442\u0440\u0430\u0442\u044B \u0438 \u043F\u043E\u0440\u043E\u0433 \u0432\u0445\u043E\u0434\u0430",
      description: isEn ? "Capital, liquidity, and setup effort required to launch" : "\u041E\u0431\u044A\u0435\u043C \u0442\u0440\u0435\u0431\u0443\u0435\u043C\u044B\u0445 \u0434\u0435\u043D\u0435\u0436\u043D\u044B\u0445 \u0438 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432 \u0434\u043B\u044F \u0441\u0442\u0430\u0440\u0442\u0430",
      weight: weight1,
      option1Score: score1_crit1,
      option1Note: note1_crit1,
      option2Score: score2_crit1,
      option2Note: note2_crit1
    },
    {
      id: "crit-2",
      category: isEn ? "Risk & Reversibility" : "\u0420\u0438\u0441\u043A\u0438 \u0438 \u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E\u0441\u0442\u044C",
      title: isEn ? "Downside Protection and Rollback Ease" : "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0440\u0438\u0441\u043A\u0430 \u0438 \u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u0440\u0435\u0448\u0435\u043D\u0438\u044F",
      description: isEn ? "Downside exposure and ability to pivot back without critical loss" : "\u0412\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C \u043D\u0435\u043F\u0440\u0435\u0434\u0432\u0438\u0434\u0435\u043D\u043D\u044B\u0445 \u0441\u0431\u043E\u0435\u0432 \u0438 \u043B\u0435\u0433\u043A\u043E\u0441\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0432 \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435",
      weight: weight2,
      option1Score: score1_crit2,
      option1Note: note1_crit2,
      option2Score: score2_crit2,
      option2Note: note2_crit2
    },
    {
      id: "crit-3",
      category: isEn ? "Strategic Upside" : "\u041F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u0440\u043E\u0441\u0442\u0430",
      title: isEn ? "Long-term Growth Ceiling & Multiplier" : "\u0414\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u044B\u0439 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u0438 \u043C\u0430\u0441\u0448\u0442\u0430\u0431 \u0432\u044B\u0433\u043E\u0434\u044B",
      description: isEn ? "Compounded upside and career/business ceiling over 3-5 years" : "\u041A\u0430\u043A\u043E\u0432\u044B \u0434\u0438\u0432\u0438\u0434\u0435\u043D\u0434\u044B \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043D\u0430 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0435 3\u20135 \u043B\u0435\u0442",
      weight: weight3,
      option1Score: score1_crit3,
      option1Note: note1_crit3,
      option2Score: score2_crit3,
      option2Note: note2_crit3
    },
    {
      id: "crit-4",
      category: isEn ? "Execution Friction" : "\u0421\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0438 \u0441\u0442\u0440\u0435\u0441\u0441",
      title: isEn ? "Operational Friction & Cognitive Load" : "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0441\u0442\u0440\u0435\u0441\u0441\u0430 \u0438 \u043A\u043E\u0433\u043D\u0438\u0442\u0438\u0432\u043D\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430",
      description: isEn ? "Daily strain imposed on team bandwidth or personal well-being" : "\u041F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0438 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043D\u0430 \u043F\u0440\u0438\u0432\u044B\u0447\u043D\u044B\u0439 \u043E\u0431\u0440\u0430\u0437 \u0436\u0438\u0437\u043D\u0438",
      weight: weight4,
      option1Score: score1_crit4,
      option1Note: note1_crit4,
      option2Score: score2_crit4,
      option2Note: note2_crit4
    },
    {
      id: "crit-5",
      category: isEn ? "Autonomy & Agility" : "\u0413\u0438\u0431\u043A\u043E\u0441\u0442\u044C \u0438 \u043C\u0430\u043D\u0435\u0432\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C",
      title: isEn ? "Strategic Flexibility & Market Adaptability" : "\u0410\u0432\u0442\u043E\u043D\u043E\u043C\u0438\u044F \u0438 \u0430\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u043A \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F\u043C",
      description: isEn ? "Freedom to adjust trajectory as circumstances fluctuate" : "\u041D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043B\u0435\u0433\u043A\u043E \u043F\u0435\u0440\u0435\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043A\u0443\u0440\u0441 \u043F\u0440\u0438 \u0441\u043C\u0435\u043D\u0435 \u0432\u043D\u0435\u0448\u043D\u0438\u0445 \u0443\u0441\u043B\u043E\u0432\u0438\u0439",
      weight: weight5,
      option1Score: score1_crit5,
      option1Note: note1_crit5,
      option2Score: score2_crit5,
      option2Note: note2_crit5
    }
  ];
  function buildProsCons(p, opposite, prefix) {
    const pros = [];
    const cons = [];
    if (p.isStability) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `High predictability and robust baseline security: "${p.title}"` : `\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u043F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0443\u0435\u043C\u043E\u0441\u0442\u044C \u0438 \u043D\u0430\u0434\u0435\u0436\u043D\u044B\u0439 \u0442\u044B\u043B: \xAB${p.title}\xBB`, weight: 4, category: isEn ? "Security" : "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C" },
        { id: `${prefix}_p2`, text: isEn ? "Smooth daily operations with minimal friction" : "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u0440\u0435\u0437\u043A\u043E\u0433\u043E \u0441\u0442\u0440\u0435\u0441\u0441\u0430 \u0430\u0434\u0430\u043F\u0442\u0430\u0446\u0438\u0438 \u0438 \u043F\u043E\u043D\u044F\u0442\u043D\u044B\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430", weight: 4, category: isEn ? "Comfort" : "\u041A\u043E\u043C\u0444\u043E\u0440\u0442" },
        { id: `${prefix}_p3`, text: isEn ? "Preservation of accumulated momentum and capital reserves" : "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u043D\u044B\u0445 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432 \u0438 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u043E\u0439 \u043F\u043E\u0434\u0443\u0448\u043A\u0438", weight: 3, category: isEn ? "Reserves" : "\u0420\u0435\u0441\u0443\u0440\u0441\u044B" }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? "Restricted growth ceiling compared to high-upside alternatives" : "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043D\u044B\u0439 \u043F\u043E\u0442\u043E\u043B\u043E\u043A \u0434\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u043E\u0433\u043E \u0440\u043E\u0441\u0442\u0430 \u043F\u043E \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044E \u0441 \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u043E\u0439", weight: 4, category: isEn ? "Ceiling" : "\u0420\u043E\u0441\u0442" },
        { id: `${prefix}_c2`, text: isEn ? "Potential opportunity cost and risk of gradual stagnation" : "\u0420\u0438\u0441\u043A \u043F\u043E\u0441\u0442\u0435\u043F\u0435\u043D\u043D\u043E\u0439 \u043F\u043E\u0442\u0435\u0440\u0438 \u043A\u043E\u043D\u043A\u0443\u0440\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0430 \u0438 \u0441\u0442\u0430\u0433\u043D\u0430\u0446\u0438\u0438", weight: 3, category: isEn ? "Strategy" : "\u041F\u0435\u0440\u0441\u043F\u0435\u043A\u0442\u0438\u0432\u044B" }
      );
    } else if (p.isGrowth) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `High compounding multiplier and breakout potential: "${p.title}"` : `\u041C\u043E\u0449\u043D\u044B\u0439 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u0441\u043A\u0430\u0447\u043A\u0430: \xAB${p.title}\xBB`, weight: 5, category: isEn ? "Upside" : "\u041F\u0435\u0440\u0441\u043F\u0435\u043A\u0442\u0438\u0432\u044B" },
        { id: `${prefix}_p2`, text: isEn ? "Accelerated development of in-demand capabilities" : "\u0411\u044B\u0441\u0442\u0440\u043E\u0435 \u043E\u0441\u0432\u043E\u0435\u043D\u0438\u0435 \u043F\u0435\u0440\u0435\u0434\u043E\u0432\u044B\u0445 \u043D\u0430\u0432\u044B\u043A\u043E\u0432 \u0438 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u0437\u043E\u043D\u044B \u0432\u043B\u0438\u044F\u043D\u0438\u044F", weight: 4, category: isEn ? "Skills" : "\u0420\u0430\u0437\u0432\u0438\u0442\u0438\u0435" },
        { id: `${prefix}_p3`, text: isEn ? "Strong motivational velocity and entrepreneurial alignment" : "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u044D\u043D\u0435\u0440\u0433\u0438\u0438, \u0430\u0432\u0442\u043E\u043D\u043E\u043C\u0438\u0438 \u0438 \u0432\u043E\u0432\u043B\u0435\u0447\u0435\u043D\u043D\u043E\u0441\u0442\u0438", weight: 3, category: isEn ? "Motivation" : "\u042D\u043D\u0435\u0440\u0433\u0438\u044F" }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? "Elevated volatility requiring disciplined risk mitigation" : "\u041F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u0430\u044F \u0432\u043E\u043B\u0430\u0442\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0438 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u0435 \u043A \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u0441\u0442\u043E\u0439\u043A\u043E\u0441\u0442\u0438", weight: 4, category: isEn ? "Risk" : "\u0420\u0438\u0441\u043A\u0438" },
        { id: `${prefix}_c2`, text: isEn ? "Heavier initial investment of focus, time, or capital" : "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u044C \u0441\u0435\u0440\u044C\u0435\u0437\u043D\u044B\u0445 \u0432\u043B\u043E\u0436\u0435\u043D\u0438\u0439 \u0441\u0438\u043B \u043D\u0430 \u044D\u0442\u0430\u043F\u0435 \u0440\u0430\u0437\u0433\u043E\u043D\u0430", weight: 4, category: isEn ? "Effort" : "\u0417\u0430\u0442\u0440\u0430\u0442\u044B" }
      );
    } else if (p.isHighCapital) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Tangible ownership and asset accumulation: "${p.title}"` : `\u0424\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0430\u043A\u0442\u0438\u0432\u0430: \xAB${p.title}\xBB`, weight: 4, category: isEn ? "Equity" : "\u0410\u043A\u0442\u0438\u0432" },
        { id: `${prefix}_p2`, text: isEn ? "Full control without dependency on third-party pricing" : "\u041F\u043E\u043B\u043D\u044B\u0439 \u0441\u0443\u0432\u0435\u0440\u0435\u043D\u0438\u0442\u0435\u0442 \u0438 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0442 \u0441\u0442\u043E\u0440\u043E\u043D\u043D\u0438\u0445 \u0443\u0441\u043B\u043E\u0432\u0438\u0439", weight: 3, category: isEn ? "Control" : "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C" }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? "Heavy liquidity lock-in and high ongoing carrying costs" : "\u0417\u0430\u043C\u043E\u0440\u043E\u0437\u043A\u0430 \u0437\u043D\u0430\u0447\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u0438 \u0438 \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u0441\u043E\u043F\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u044B", weight: 5, category: isEn ? "Liquidity" : "\u0424\u0438\u043D\u0430\u043D\u0441\u044B" },
        { id: `${prefix}_c2`, text: isEn ? "Impaired mobility and substantial friction upon disposal" : "\u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043A \u043C\u0435\u0441\u0442\u0443 \u0438 \u0441\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u0432\u044B\u0445\u043E\u0434\u0430 \u0431\u0435\u0437 \u043F\u043E\u0442\u0435\u0440\u044C", weight: 4, category: isEn ? "Flexibility" : "\u0413\u0438\u0431\u043A\u043E\u0441\u0442\u044C" }
      );
    } else if (p.isLeanVariable) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Zero upfront capital strain with preserved liquidity: "${p.title}"` : `\u041D\u0443\u043B\u0435\u0432\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043D\u0430 \u043A\u0430\u043F\u0438\u0442\u0430\u043B \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u043D\u043E\u0441\u0442\u044C \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0439 \u043B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u0438: \xAB${p.title}\xBB`, weight: 5, category: isEn ? "Liquidity" : "\u041B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u044C" },
        { id: `${prefix}_p2`, text: isEn ? "Maximum agility: pause, reconfigure, or stop without penalty" : "\u0410\u0431\u0441\u043E\u043B\u044E\u0442\u043D\u0430\u044F \u043C\u043E\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C: \u043B\u0435\u0433\u043A\u0430\u044F \u043F\u0430\u0443\u0437\u0430 \u0438\u043B\u0438 \u0441\u043C\u0435\u043D\u0430 \u0444\u043E\u0440\u043C\u0430\u0442\u0430 \u0431\u0435\u0437 \u0448\u0442\u0440\u0430\u0444\u043E\u0432", weight: 4, category: isEn ? "Agility" : "\u0413\u0438\u0431\u043A\u043E\u0441\u0442\u044C" }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? "Absence of long-term accumulated tangible equity" : "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0430\u043A\u0442\u0438\u0432\u0430 \u0432 \u043B\u0438\u0447\u043D\u043E\u0439 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0441\u0442\u0438", weight: 3, category: isEn ? "Equity" : "\u041A\u0430\u043F\u0438\u0442\u0430\u043B" },
        { id: `${prefix}_c2`, text: isEn ? "Ongoing dependency on provider tariffs and availability" : "\u0417\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0442 \u0442\u0430\u0440\u0438\u0444\u043E\u0432 \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u0441\u0435\u0440\u0432\u0438\u0441\u0430 \u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430", weight: 3, category: isEn ? "Dependency" : "\u0417\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C" }
      );
    } else if (p.isSimpleArch) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Radical simplicity, atomic deployments, and fast velocity: "${p.title}"` : `\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0441\u0442\u043E\u0442\u0430 \u0440\u0430\u0437\u0432\u0435\u0440\u0442\u044B\u0432\u0430\u043D\u0438\u044F \u0438 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438: \xAB${p.title}\xBB`, weight: 5, category: isEn ? "Velocity" : "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C" },
        { id: `${prefix}_p2`, text: isEn ? "Zero distributed systems overhead or networking complexity" : "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u0441\u0435\u0442\u0435\u0432\u044B\u0445 \u043D\u0430\u043A\u043B\u0430\u0434\u043D\u044B\u0445 \u0440\u0430\u0441\u0445\u043E\u0434\u043E\u0432 \u0438 \u0441\u043B\u043E\u0436\u043D\u043E\u0439 \u043E\u0440\u043A\u0435\u0441\u0442\u0440\u0430\u0446\u0438\u0438", weight: 4, category: isEn ? "Simplicity" : "\u041D\u0430\u0434\u0435\u0436\u043D\u043E\u0441\u0442\u044C" }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? "Discipline required to prevent boundaries from eroding over time" : "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u0430\u044F \u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0430 \u0432\u043E \u0438\u0437\u0431\u0435\u0436\u0430\u043D\u0438\u0435 \u0437\u0430\u043F\u0443\u0442\u044B\u0432\u0430\u043D\u0438\u044F \u043C\u043E\u0434\u0443\u043B\u0435\u0439", weight: 3, category: isEn ? "Governance" : "\u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430" }
      );
    } else if (p.isComplexArch) {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Independent scaling boundaries and decoupled services: "${p.title}"` : `\u041D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0435 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043E\u0432 \u0438 \u0438\u0437\u043E\u043B\u044F\u0446\u0438\u044F \u0441\u0431\u043E\u0435\u0432: \xAB${p.title}\xBB`, weight: 4, category: isEn ? "Scale" : "\u041C\u0430\u0441\u0448\u0442\u0430\u0431" },
        { id: `${prefix}_p2`, text: isEn ? "Technology diversity across domain boundaries" : "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0441\u0442\u0435\u043A \u043F\u043E\u0434 \u043A\u0430\u0436\u0434\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441", weight: 3, category: isEn ? "Flexibility" : "\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438" }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? "High infrastructure complexity and operational toll on a small team" : "\u041A\u043E\u043B\u043E\u0441\u0441\u0430\u043B\u044C\u043D\u044B\u0435 \u043D\u0430\u043A\u043B\u0430\u0434\u043D\u044B\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u043D\u0430 \u0438\u043D\u0444\u0440\u0430\u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0443 \u0434\u043B\u044F \u043D\u0435\u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u044B", weight: 5, category: isEn ? "Overhead" : "\u0421\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C" },
        { id: `${prefix}_c2`, text: isEn ? "Complex distributed debugging, tracing, and data consistency" : "\u0421\u043B\u043E\u0436\u043D\u0430\u044F \u043E\u0442\u043B\u0430\u0434\u043A\u0430 \u0440\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u043D\u044B\u0445 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439 \u0438 \u0441\u0435\u0442\u0435\u0432\u044B\u0445 \u0437\u0430\u0434\u0435\u0440\u0436\u0435\u043A", weight: 4, category: isEn ? "Debugging" : "\u041E\u0442\u043B\u0430\u0434\u043A\u0430" }
      );
    } else {
      pros.push(
        { id: `${prefix}_p1`, text: isEn ? `Direct focus on primary objective: "${p.title}"` : `\u0421\u0444\u043E\u043A\u0443\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0441\u0442\u044C \u043D\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u0438 \u043A\u043B\u044E\u0447\u0435\u0432\u043E\u0439 \u0437\u0430\u0434\u0430\u0447\u0438: \xAB${p.title}\xBB`, weight: 4, category: isEn ? "Focus" : "\u0426\u0435\u043B\u044C" },
        { id: `${prefix}_p2`, text: isEn ? "Established precedent with documented success cases" : "\u041D\u0430\u043B\u0438\u0447\u0438\u0435 \u043F\u043E\u043D\u044F\u0442\u043D\u043E\u0439 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0438 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u043E\u0440\u0438\u0435\u043D\u0442\u0438\u0440\u043E\u0432", weight: 3, category: isEn ? "Execution" : "\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0430" }
      );
      cons.push(
        { id: `${prefix}_c1`, text: isEn ? `Specific trade-offs inherent to path: "${p.title}"` : `\u0421\u043F\u0435\u0446\u0438\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F, \u043F\u0440\u0438\u0441\u0443\u0449\u0438\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C\u0443 \u043F\u0443\u0442\u0438: \xAB${p.title}\xBB`, weight: 3, category: isEn ? "Tradeoff" : "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F" }
      );
    }
    return { pros, cons };
  }
  const prosCons1 = buildProsCons(p1, p2, "p1");
  const prosCons2 = buildProsCons(p2, p1, "p2");
  function buildSwot(p, opposite) {
    if (p.isStability) {
      return {
        strengths: isEn ? ["Proven operational foundation and predictable guidelines", "Minimal systemic downside exposure and established buffer", "Resilience against adverse macroeconomic volatility"] : ["\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u0430\u044F \u0431\u0430\u0437\u0430 \u0438 \u043F\u043E\u043D\u044F\u0442\u043D\u044B\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430", "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0438\u0441\u043A \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u043E\u0448\u0438\u0431\u043E\u043A \u0438 \u043D\u0430\u0434\u0435\u0436\u043D\u044B\u0439 \u0442\u044B\u043B", "\u0423\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u043E\u0441\u0442\u044C \u043A \u043D\u0435\u0431\u043B\u0430\u0433\u043E\u043F\u0440\u0438\u044F\u0442\u043D\u044B\u043C \u0432\u043D\u0435\u0448\u043D\u0438\u043C \u043A\u043E\u043B\u0435\u0431\u0430\u043D\u0438\u044F\u043C"],
        weaknesses: isEn ? ["Conservative velocity and slower compounding rate", "Vulnerability to disengagement from repetitive routines", "Ceiling on maximum asymmetric financial return"] : ["\u041C\u0435\u0434\u043B\u0435\u043D\u043D\u044B\u0439 \u0442\u0435\u043C\u043F \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u0440\u043E\u0441\u0442\u0430", "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0435 \u0432\u044B\u0433\u043E\u0440\u0430\u043D\u0438\u0435 \u043E\u0442 \u0440\u0443\u0442\u0438\u043D\u044B \u0438 \u0434\u0435\u0444\u0438\u0446\u0438\u0442 \u0432\u0434\u043E\u0445\u043D\u043E\u0432\u0435\u043D\u0438\u044F", "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043D\u044B\u0439 \u043F\u043E\u0442\u043E\u043B\u043E\u043A \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u043E\u0442\u0434\u0430\u0447\u0438"],
        opportunities: isEn ? ["Steady capital accrual while preparing an opportunistic future leap", "Deepening core defensibility within an established domain"] : ["\u041F\u043E\u0441\u0442\u0435\u043F\u0435\u043D\u043D\u043E\u0435 \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043E\u0432 \u0438 \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0430 \u043A \u0431\u0443\u0434\u0443\u0449\u0435\u043C\u0443 \u0441\u043A\u0430\u0447\u043A\u0443", "\u0423\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0437\u0438\u0446\u0438\u0439 \u0438 \u0440\u0435\u043F\u0443\u0442\u0430\u0446\u0438\u0438 \u0432 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0439 \u043D\u0438\u0448\u0435"],
        threats: isEn ? ["Gradual obsolescence under pressure from agile competitors", "Opportunity cost from delaying modernization"] : ["\u0423\u0441\u0442\u0430\u0440\u0435\u0432\u0430\u043D\u0438\u0435 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043F\u043E\u0434 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C \u043D\u043E\u0432\u044B\u0445 \u0440\u0435\u0430\u043B\u0438\u0439", "\u0423\u043F\u0443\u0449\u0435\u043D\u043D\u044B\u0435 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u0438 \u043F\u043E\u0442\u0435\u0440\u044F \u0434\u0440\u0430\u0439\u0432\u0430"]
      };
    } else if (p.isGrowth) {
      return {
        strengths: isEn ? ["Dynamic forward velocity and aggressive market capture", "Rapid skill acquisition and modern methodology adoption", "High ownership, intrinsic motivation, and team engagement"] : ["\u041C\u043E\u0449\u043D\u044B\u0439 \u0432\u0435\u043A\u0442\u043E\u0440 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u044F \u0438 \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u043D\u043E\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0432\u043F\u0435\u0440\u0435\u0434", "\u041E\u043F\u0435\u0440\u0435\u0436\u0435\u043D\u0438\u0435 \u043A\u043E\u043D\u043A\u0443\u0440\u0435\u043D\u0442\u043E\u0432 \u0438 \u043E\u0441\u0432\u043E\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0438\u0432\u043D\u044B\u0445 \u043F\u043E\u0434\u0445\u043E\u0434\u043E\u0432", "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0432\u043E\u0432\u043B\u0435\u0447\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0438 \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u043E\u0442\u0434\u0430\u0447\u0430"],
        weaknesses: isEn ? ["Elevated sensitivity to execution missteps in early phases", "Absence of established safety nets requiring frequent course adjustments"] : ["\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0447\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043A \u043E\u0448\u0438\u0431\u043A\u0430\u043C \u043D\u0430 \u0440\u0430\u043D\u043D\u0435\u043C \u044D\u0442\u0430\u043F\u0435", "\u041D\u0435\u0445\u0432\u0430\u0442\u043A\u0430 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0439 \u0438 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u044C \u0447\u0430\u0441\u0442\u044B\u0445 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u043E\u043A"],
        opportunities: isEn ? ["Breakthrough into an elite market or career tier", "Establishing sustainable long-term competitive moat"] : ["\u0412\u044B\u0445\u043E\u0434 \u043D\u0430 \u043F\u0440\u0438\u043D\u0446\u0438\u043F\u0438\u0430\u043B\u044C\u043D\u043E \u043D\u043E\u0432\u044B\u0439 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C", "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0441\u0438\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u043E\u043D\u043A\u0443\u0440\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0430 \u043D\u0430 \u0433\u043E\u0434\u044B \u0432\u043F\u0435\u0440\u0435\u0434"],
        threats: isEn ? ["Premature resource exhaustion before reaching positive unit traction", "Adverse external shocks during transition window"] : ["\u041F\u0435\u0440\u0435\u043E\u0446\u0435\u043D\u043A\u0430 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0445 \u0441\u0438\u043B \u0438 \u043F\u0440\u0435\u0436\u0434\u0435\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0435 \u0438\u0441\u0442\u043E\u0449\u0435\u043D\u0438\u0435 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432", "\u0420\u0435\u0437\u043A\u0438\u0435 \u043D\u0435\u043F\u0440\u0435\u0434\u0432\u0438\u0434\u0435\u043D\u043D\u044B\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0432\u043D\u0435\u0448\u043D\u0438\u0445 \u0443\u0441\u043B\u043E\u0432\u0438\u0439"]
      };
    } else if (p.isHighCapital) {
      return {
        strengths: isEn ? ["Tangible equity ownership and wealth preservation asset", "Independence from fluctuating landlord/supplier terms"] : ["\u0424\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0442\u0432\u0435\u0440\u0434\u043E\u0433\u043E \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0430\u043A\u0442\u0438\u0432\u0430", "\u041D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0442 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0443\u0441\u043B\u043E\u0432\u0438\u0439 \u0442\u0440\u0435\u0442\u044C\u0438\u0445 \u043B\u0438\u0446"],
        weaknesses: isEn ? ["Heavy liquidity depletion and high ongoing maintenance overhead", "Significant barrier to exit or liquidation"] : ["\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0434\u043E\u043B\u0433\u043E\u0432\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438\u043B\u0438 \u0437\u0430\u043C\u043E\u0440\u043E\u0437\u043A\u0430 \u043B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u0438", "\u0421\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0431\u044B\u0441\u0442\u0440\u043E\u0439 \u043B\u0438\u043A\u0432\u0438\u0434\u0430\u0446\u0438\u0438 \u0431\u0435\u0437 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u043E\u0433\u043E \u0434\u0438\u0441\u043A\u043E\u043D\u0442\u0430"],
        opportunities: isEn ? ["Long-term asset appreciation and collateral power", "Stability for family planning and peace of mind"] : ["\u0414\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u044B\u0439 \u043F\u0440\u0438\u0440\u043E\u0441\u0442 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0430\u043A\u0442\u0438\u0432\u0430", "\u041D\u0430\u0434\u0435\u0436\u043D\u0430\u044F \u0431\u0430\u0437\u0430 \u0434\u043B\u044F \u0434\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u043E\u0433\u043E \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0436\u0438\u0437\u043D\u0438"],
        threats: isEn ? ["Depreciation or unforeseen maintenance capital requirements", "Immobility should career or market necessitate relocation"] : ["\u041D\u0435\u043F\u0440\u0435\u0434\u0432\u0438\u0434\u0435\u043D\u043D\u044B\u0435 \u0441\u043E\u043F\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u0442\u0440\u0430\u0442\u044B \u0438 \u0430\u043C\u043E\u0440\u0442\u0438\u0437\u0430\u0446\u0438\u044F", "\u041F\u043E\u0442\u0435\u0440\u044F \u043C\u043E\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u0438 \u043F\u0440\u0438 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u0438 \u0441\u043C\u0435\u043D\u044B \u043B\u043E\u043A\u0430\u0446\u0438\u0438"]
      };
    } else if (p.isLeanVariable) {
      return {
        strengths: isEn ? ["Preservation of liquid cash for high-yield deployment", "Effortless scalability and zero depreciation liabilities"] : ["\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u043B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u0438 \u0434\u043B\u044F \u0432\u044B\u0441\u043E\u043A\u043E\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0445 \u0432\u043B\u043E\u0436\u0435\u043D\u0438\u0439", "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432 \u043F\u043E \u0430\u043C\u043E\u0440\u0442\u0438\u0437\u0430\u0446\u0438\u0438 \u0438 \u0442\u0435\u0445\u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u044E"],
        weaknesses: isEn ? ["Recurring operational expense without residual equity build", "Exposure to service availability and third-party fee increases"] : ["\u0420\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u0431\u0435\u0437 \u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E\u0433\u043E \u043A\u0430\u043F\u0438\u0442\u0430\u043B\u0430", "\u0417\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0442 \u0446\u0435\u043D \u0438 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u0430"],
        opportunities: isEn ? ["Freedom to pivot location, tooling, or lifestyle instantaneously", "Compound investment returns from retained capital"] : ["\u0421\u0432\u043E\u0431\u043E\u0434\u0430 \u0441\u043C\u0435\u043D\u0438\u0442\u044C \u043E\u0431\u0440\u0430\u0437 \u0436\u0438\u0437\u043D\u0438 \u0438\u043B\u0438 \u043B\u043E\u043A\u0430\u0446\u0438\u044E \u0432 \u043B\u044E\u0431\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442", "\u0414\u043E\u0445\u043E\u0434\u043D\u043E\u0441\u0442\u044C \u043E\u0442 \u0438\u043D\u0432\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u0430\u043F\u0438\u0442\u0430\u043B\u0430"],
        threats: isEn ? ["Long-term cumulative rental inflation exceeding ownership costs", "Sudden policy shifts by service platforms"] : ["\u0414\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u044B\u0439 \u0440\u043E\u0441\u0442 \u0442\u0430\u0440\u0438\u0444\u043E\u0432 \u0441\u0435\u0440\u0432\u0438\u0441\u043E\u0432", "\u0412\u043D\u0435\u0437\u0430\u043F\u043D\u044B\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u0430\u0432\u0438\u043B \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u044F"]
      };
    } else {
      return {
        strengths: isEn ? ["Direct alignment with immediate requirements", "Predictable operational footprint"] : ["\u041F\u0440\u044F\u043C\u043E\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043D\u043E\u0439 \u0437\u0430\u0434\u0430\u0447\u0435", "\u041F\u043E\u043D\u044F\u0442\u043D\u044B\u0439 \u043F\u043B\u0430\u043D \u043F\u0435\u0440\u0432\u043E\u043E\u0447\u0435\u0440\u0435\u0434\u043D\u044B\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439"],
        weaknesses: isEn ? ["Trade-offs in adjacent dimensions", "Requires focused management bandwidth"] : ["\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u044C \u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u043E\u043C\u043F\u0440\u043E\u043C\u0438\u0441\u0441\u044B", "\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u0435 \u043A \u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F"],
        opportunities: isEn ? ["Achieving the target milestone with minimum friction", "Building confidence through incremental wins"] : ["\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u0446\u0435\u043B\u0438 \u0441 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u0443\u0435\u043C\u044B\u043C\u0438 \u0437\u0430\u0442\u0440\u0430\u0442\u0430\u043C\u0438", "\u0423\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0437\u0438\u0446\u0438\u0439 \u0447\u0435\u0440\u0435\u0437 \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0448\u0430\u0433\u0438"],
        threats: isEn ? ["Unanticipated external condition changes", "Alternative becoming unexpectedly superior"] : ["\u041D\u0435\u043F\u0440\u0435\u0434\u0432\u0438\u0434\u0435\u043D\u043D\u044B\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0432\u043D\u0435\u0448\u043D\u0438\u0445 \u0443\u0441\u043B\u043E\u0432\u0438\u0439", "\u0420\u0438\u0441\u043A \u043D\u0435\u0434\u043E\u043E\u0446\u0435\u043D\u043A\u0438 \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u043F\u0443\u0442\u0438"]
      };
    }
  }
  const swot = {
    option1: buildSwot(p1, p2),
    option2: buildSwot(p2, p1)
  };
  const totalWeights = comparisonTable.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum1 = comparisonTable.reduce((sum, c) => sum + c.option1Score * c.weight, 0);
  const weightedSum2 = comparisonTable.reduce((sum, c) => sum + c.option2Score * c.weight, 0);
  const pct1 = weightedSum1 / (totalWeights * 10) * 100;
  const pct2 = weightedSum2 / (totalWeights * 10) * 100;
  const prosWeight1 = prosCons1.pros.reduce((s, p) => s + p.weight, 0);
  const consWeight1 = prosCons1.cons.reduce((s, c) => s + c.weight, 0);
  const netProsCons1 = prosWeight1 - consWeight1;
  const prosWeight2 = prosCons2.pros.reduce((s, p) => s + p.weight, 0);
  const consWeight2 = prosCons2.cons.reduce((s, c) => s + c.weight, 0);
  const netProsCons2 = prosWeight2 - consWeight2;
  const criteriaDiff = pct1 - pct2;
  const prosConsDiff = (netProsCons1 - netProsCons2) * 1.5;
  const totalScoreDiff = criteriaDiff + prosConsDiff;
  let winner = "tie";
  let winnerTitle = "";
  let confidenceScore = 50;
  if (totalScoreDiff > 2.5) {
    winner = "option1";
    winnerTitle = opt1;
    confidenceScore = Math.min(88, Math.max(60, Math.round(60 + Math.abs(totalScoreDiff) * 2.2)));
  } else if (totalScoreDiff < -2.5) {
    winner = "option2";
    winnerTitle = opt2;
    confidenceScore = Math.min(88, Math.max(60, Math.round(60 + Math.abs(totalScoreDiff) * 2.2)));
  } else {
    winner = "tie";
    winnerTitle = isEn ? "Equal Parity / Balanced Trade-off" : "\u0420\u0430\u0432\u043D\u044B\u0439 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0430\u0440\u0438\u0442\u0435\u0442";
    confidenceScore = 52;
  }
  let summary = "";
  let keyDrivers = [];
  let tradeOffSummary = "";
  let recommendedNextSteps = [];
  if (winner === "option1") {
    if (isEn) {
      summary = `Based on multi-dimensional objective scoring, "${opt1}" emerges as the recommended path with a composite rating of ${pct1.toFixed(0)}% vs ${pct2.toFixed(0)}%. It delivers superior risk-adjusted return, capital efficiency, and alignment with your stated priorities while avoiding excessive early volatility.`;
      keyDrivers = [
        `Decisive advantage in downside protection and capital preservation (${score1_crit2}/10 vs ${score2_crit2}/10)`,
        `Lower operational friction and mental stress during execution (${score1_crit4}/10 vs ${score2_crit4}/10)`,
        `Strong structural alignment with risk constraints and predictable resource allocation`
      ];
      tradeOffSummary = `By committing to "${opt1}", you trade explosive speculative upside for defensive resilience and peace of mind. To compensate, proactively schedule quarterly reviews to capture growth opportunities without compromising stability.`;
      recommendedNextSteps = [
        `Lock in the core commitments for "${opt1}" and establish clear 30-day milestones`,
        `Optimize budget and resources to maximize the upside of this chosen baseline`,
        `Formalize contingency trigger points for reassessing high-growth alternatives in 6\u201312 months`
      ];
    } else {
      summary = `\u041F\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u043C \u043C\u043D\u043E\u0433\u043E\u0444\u0430\u043A\u0442\u043E\u0440\u043D\u043E\u0433\u043E \u0441\u043A\u043E\u0440\u0438\u043D\u0433\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442 \xAB${opt1}\xBB \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442 \u0438\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0432\u0435\u0441 (${pct1.toFixed(0)}% \u043F\u0440\u043E\u0442\u0438\u0432 ${pct2.toFixed(0)}%). \u041E\u043D \u043E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0432\u0430\u0435\u0442 \u043E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u043A\u0430\u043F\u0438\u0442\u0430\u043B\u0430, \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C\u043E\u0441\u0442\u0438 \u0440\u0438\u0441\u043A\u043E\u0432 \u0438 \u043F\u043E\u043B\u043D\u043E\u0433\u043E \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u044F \u043E\u0431\u043E\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044B\u043C \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F\u043C, \u0438\u0437\u0431\u0435\u0433\u0430\u044F \u043D\u0435\u043E\u043F\u0440\u0430\u0432\u0434\u0430\u043D\u043D\u043E\u0433\u043E \u0441\u0442\u0440\u0435\u0441\u0441\u0430.`;
      keyDrivers = [
        `\u0421\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0432\u0435\u0441 \u043F\u043E \u043A\u0440\u0438\u0442\u0435\u0440\u0438\u044F\u043C \u043D\u0430\u0434\u0435\u0436\u043D\u043E\u0441\u0442\u0438 \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432 (${score1_crit2}/10 \u043F\u0440\u043E\u0442\u0438\u0432 ${score2_crit2}/10)`,
        `\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u0433\u043D\u0438\u0442\u0438\u0432\u043D\u0430\u044F \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438 \u043F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0443\u0435\u043C\u043E\u0441\u0442\u044C \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F (${score1_crit4}/10 \u043F\u0440\u043E\u0442\u0438\u0432 ${score2_crit4}/10)`,
        `\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u0442\u0435\u043A\u0443\u0449\u0438\u043C \u0436\u0438\u0437\u043D\u0435\u043D\u043D\u044B\u043C \u0438 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u043C \u043F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442\u0430\u043C`
      ];
      tradeOffSummary = `\u0412\u044B\u0431\u0438\u0440\u0430\u044F \xAB${opt1}\xBB, \u0432\u044B \u0440\u0430\u0437\u043C\u0435\u043D\u0438\u0432\u0430\u0435\u0442\u0435 \u0432\u0437\u0440\u044B\u0432\u043D\u043E\u0439 \u0441\u043F\u0435\u043A\u0443\u043B\u044F\u0442\u0438\u0432\u043D\u044B\u0439 \u0440\u043E\u0441\u0442 \u043D\u0430 \u043F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0443\u0435\u043C\u043E\u0441\u0442\u044C \u0438 \u043D\u0430\u0434\u0435\u0436\u043D\u044B\u0439 \u0442\u044B\u043B. \u0427\u0442\u043E\u0431\u044B \u043D\u0435 \u0443\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B, \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0441\u043C\u043E\u0442\u0440 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0438 \u0440\u0430\u0437 \u0432 \u043F\u043E\u043B\u0433\u043E\u0434\u0430.`;
      recommendedNextSteps = [
        `\u0417\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u0438 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0435 \u0442\u043E\u0447\u043A\u0438 \u043F\u043E \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0443 \xAB${opt1}\xBB \u043D\u0430 \u043F\u0435\u0440\u0432\u044B\u0435 30 \u0434\u043D\u0435\u0439`,
        `\u041E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0440\u0430\u0441\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0441\u0438\u043B \u0438 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432 \u0434\u043B\u044F \u0432\u044B\u0436\u0438\u043C\u0430\u043D\u0438\u044F \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C\u0430 \u0438\u0437 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0432\u044B\u0431\u043E\u0440\u0430`,
        `\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u0438 \u043C\u0435\u0442\u0440\u0438\u043A\u0438, \u043F\u0440\u0438 \u043D\u0430\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u0438 \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u0441\u0442\u043E\u0438\u0442 \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u0438\u044E \u0431\u043E\u043B\u0435\u0435 \u0440\u0438\u0441\u043A\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432`
      ];
    }
  } else if (winner === "option2") {
    if (isEn) {
      summary = `Upon multi-criteria evaluation, "${opt2}" outscores the alternative (${pct2.toFixed(0)}% vs ${pct1.toFixed(0)}%). It presents superior strategic leverage and compounded return potential, making it the mathematically optimal decision under dynamic growth parameters.`;
      keyDrivers = [
        `Clear strategic dominance in long-term growth and multiplier (${score2_crit3}/10 vs ${score1_crit3}/10)`,
        `Higher agility, market responsiveness, and decision autonomy (${score2_crit5}/10 vs ${score1_crit5}/10)`,
        `Superior risk-adjusted return when backed by a disciplined execution plan`
      ];
      tradeOffSummary = `By opting for "${opt2}", you exchange near-term tranquility for long-term breakout capability. Staged milestone rollouts and risk buffers are strongly recommended to bound downside risk.`;
      recommendedNextSteps = [
        `Define unambiguous 30/60/90-day progress milestones for "${opt2}"`,
        `Formalize contingency safeguards and downside circuit-breakers to cap exposure`,
        `Execute the top 3 tactical activation actions within the next 7 calendar days`
      ];
    } else {
      summary = `\u041F\u0440\u0438 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0441\u043D\u043E\u043C \u0430\u043D\u0430\u043B\u0438\u0437\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442 \xAB${opt2}\xBB \u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0438\u0440\u0443\u0435\u0442 \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0432\u0435\u0441 (${pct2.toFixed(0)}% \u043F\u0440\u043E\u0442\u0438\u0432 ${pct1.toFixed(0)}%). \u041E\u043D \u043E\u0431\u043B\u0430\u0434\u0430\u0435\u0442 \u0437\u043D\u0430\u0447\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0431\u043E\u043B\u0435\u0435 \u0432\u044B\u0441\u043E\u043A\u0438\u043C \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u043E\u043C \u0438 \u043E\u043A\u0443\u043F\u0430\u0435\u043C\u043E\u0441\u0442\u044C\u044E, \u044F\u0432\u043B\u044F\u044F\u0441\u044C \u043D\u0430\u0438\u043B\u0443\u0447\u0448\u0438\u043C \u0432\u044B\u0431\u043E\u0440\u043E\u043C \u0434\u043B\u044F \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0440\u044B\u0432\u0430.`;
      keyDrivers = [
        `\u0421\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u0432\u0435\u0441 \u043F\u043E \u043A\u0440\u0438\u0442\u0435\u0440\u0438\u044E \u0434\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u043E\u0433\u043E \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F (${score2_crit3}/10 \u043F\u0440\u043E\u0442\u0438\u0432 ${score1_crit3}/10)`,
        `\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u043C\u0430\u043D\u0435\u0432\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C, \u0430\u0432\u0442\u043E\u043D\u043E\u043C\u0438\u044F \u0438 \u0430\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u043A \u0440\u044B\u043D\u043A\u0443 (${score2_crit5}/10 \u043F\u0440\u043E\u0442\u0438\u0432 ${score1_crit5}/10)`,
        `\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u0441\u043A\u0430\u0447\u043A\u0430 \u0432\u043C\u0435\u0441\u0442\u043E \u0437\u0430\u0442\u044F\u0436\u043D\u043E\u0439 \u0441\u0442\u0430\u0433\u043D\u0430\u0446\u0438\u0438`
      ];
      tradeOffSummary = `\u0412\u044B\u0431\u0438\u0440\u0430\u044F \xAB${opt2}\xBB, \u0432\u044B \u0440\u0430\u0437\u043C\u0435\u043D\u0438\u0432\u0430\u0435\u0442\u0435 \u0441\u0438\u044E\u043C\u0438\u043D\u0443\u0442\u043D\u043E\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u0435 \u043D\u0430 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0440\u044B\u0432\u043E\u043A. \u0414\u043B\u044F \u043D\u0435\u0439\u0442\u0440\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0440\u0438\u0441\u043A\u043E\u0432 \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u0430\u0436\u043D\u043E \u0432\u043D\u0435\u0434\u0440\u044F\u0442\u044C \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u043F\u043E\u044D\u0442\u0430\u043F\u043D\u043E \u0441 \u043F\u043E\u0434\u0443\u0448\u043A\u043E\u0439 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438.`;
      recommendedNextSteps = [
        `\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0435 \u0442\u043E\u0447\u043A\u0438 (Milestones) \u0434\u043B\u044F \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \xAB${opt2}\xBB \u043D\u0430 30/60/90 \u0434\u043D\u0435\u0439`,
        `\u0421\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u043B\u0430\u043D \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0433\u043B\u0430\u0432\u043D\u044B\u043C\u0438 \u0440\u0438\u0441\u043A\u0430\u043C\u0438 \u0438 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u044D\u043A\u0441\u0442\u0440\u0435\u043D\u043D\u043E\u0433\u043E \u043E\u0442\u043A\u0430\u0442\u0430`,
        `\u0421\u043E\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043F\u0435\u0440\u0432\u044B\u0435 3 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u043F\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u0443 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0439 \u043D\u0435\u0434\u0435\u043B\u0438`
      ];
    }
  } else {
    if (isEn) {
      summary = `Both "${opt1}" and "${opt2}" present an exceptionally balanced trade-off (${pct1.toFixed(0)}% vs ${pct2.toFixed(0)}%). Neither option strictly dominates the other across all dimensions: one leads in stability and resilience, while the other excels in agility and growth.`;
      keyDrivers = [
        `Direct balance between security and upside potential (${pct1.toFixed(0)}% vs ${pct2.toFixed(0)}%)`,
        `Each option holds distinct non-overlapping competitive strengths`,
        `The final decision hinges directly on your personal threshold for risk vs velocity`
      ];
      tradeOffSummary = `There is no objective structural loser here. The decision is purely a strategic value judgment between certainty and ambition.`;
      recommendedNextSteps = [
        `Run a low-cost, 14-day small-scale pilot or simulation before irreversible commitment`,
        `Define a single tie-breaking constraint (e.g. strict monthly budget or hard timeline)`,
        `Consult a key stakeholder or peer who will be directly impacted by the outcome`
      ];
    } else {
      summary = `\u041E\u0431\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 (\xAB${opt1}\xBB \u0438 \xAB${opt2}\xBB) \u043D\u0430\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u0432 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \u0431\u043B\u0438\u0437\u043A\u043E\u0433\u043E \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043F\u0430\u0440\u0438\u0442\u0435\u0442\u0430 (${pct1.toFixed(0)}% \u043F\u0440\u043E\u0442\u0438\u0432 ${pct2.toFixed(0)}%). \u041D\u0438 \u043E\u0434\u0438\u043D \u0438\u0437 \u043D\u0438\u0445 \u0431\u0435\u0437\u0443\u0441\u043B\u043E\u0432\u043D\u043E \u043D\u0435 \u0434\u043E\u043C\u0438\u043D\u0438\u0440\u0443\u0435\u0442: \u043E\u0434\u0438\u043D \u0432\u044B\u0438\u0433\u0440\u044B\u0432\u0430\u0435\u0442 \u0432 \u043D\u0430\u0434\u0435\u0436\u043D\u043E\u0441\u0442\u0438 \u0438 \u043F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0443\u0435\u043C\u043E\u0441\u0442\u0438, \u0430 \u0432\u0442\u043E\u0440\u043E\u0439 \u2014 \u0432 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u0435 \u0438 \u0433\u0438\u0431\u043A\u043E\u0441\u0442\u0438.`;
      keyDrivers = [
        `\u0420\u0430\u0432\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441 \u043C\u0435\u0436\u0434\u0443 \u043D\u0430\u0434\u0435\u0436\u043D\u043E\u0441\u0442\u044C\u044E \u0438 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u043E\u043C \u0440\u043E\u0441\u0442\u0430 (${pct1.toFixed(0)}% \u043F\u0440\u043E\u0442\u0438\u0432 ${pct2.toFixed(0)}%)`,
        `\u041A\u0430\u0436\u0434\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442 \u043E\u0431\u043B\u0430\u0434\u0430\u0435\u0442 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043D\u044B\u043C\u0438 \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0430\u043C\u0438 \u0432 \u0441\u0432\u043E\u0438\u0445 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F\u0445`,
        `\u0412\u044B\u0431\u043E\u0440 \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0432\u0430\u0448\u0435\u0433\u043E \u043B\u0438\u0447\u043D\u043E\u0433\u043E \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442\u0430 (\u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 vs \u043F\u0440\u043E\u0440\u044B\u0432)`
      ];
      tradeOffSummary = `\u0412 \u0434\u0430\u043D\u043D\u043E\u0439 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u0438 \u043D\u0435\u0442 \u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u043E \u0445\u0443\u0434\u0448\u0435\u0433\u043E \u0440\u0435\u0448\u0435\u043D\u0438\u044F. \u0412\u044B\u0431\u043E\u0440 \u043C\u0435\u0436\u0434\u0443 \u043D\u0438\u043C\u0438 \u2014 \u044D\u0442\u043E \u0432\u044B\u0431\u043E\u0440 \u043B\u0438\u0447\u043D\u043E\u0439 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0438 \u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u044F \u043A \u0440\u0438\u0441\u043A\u0443.`;
      recommendedNextSteps = [
        `\u041F\u0440\u043E\u0432\u0435\u0441\u0442\u0438 \u043D\u0435\u0434\u043E\u0440\u043E\u0433\u043E\u0439 \u0434\u0432\u0443\u0445\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u0442\u0435\u0441\u0442-\u0434\u0440\u0430\u0439\u0432 \u0438\u043B\u0438 \u043F\u0438\u043B\u043E\u0442\u043D\u0443\u044E \u043F\u0440\u043E\u0431\u0443 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u0444\u043E\u0440\u043C\u0430\u0442\u0430`,
        `\u0412\u044B\u0434\u0435\u043B\u0438\u0442\u044C \u043E\u0434\u0438\u043D \u0440\u0435\u0448\u0430\u044E\u0449\u0438\u0439 \u043A\u0440\u0438\u0442\u0435\u0440\u0438\u0439-\u043E\u0442\u0441\u0435\u0447\u043A\u0443 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0436\u0435\u0441\u0442\u043A\u0438\u0439 \u043B\u0438\u043C\u0438\u0442 \u0431\u044E\u0434\u0436\u0435\u0442\u0430 \u0438\u043B\u0438 \u0434\u0435\u0434\u043B\u0430\u0439\u043D)`,
        `\u041E\u0431\u0441\u0443\u0434\u0438\u0442\u044C \u0432\u044B\u0431\u043E\u0440 \u0441 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u043C\u0438 \u0437\u0430\u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043E\u0432\u0430\u043D\u043D\u044B\u043C\u0438 \u043B\u0438\u0446\u0430\u043C\u0438, \u043D\u0430 \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u043F\u043E\u0432\u043B\u0438\u044F\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442`
      ];
    }
  }
  return {
    id: "analysis-" + Date.now(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    option1Title: opt1,
    option2Title: opt2,
    context: context?.trim() || void 0,
    prosCons: {
      option1: prosCons1,
      option2: prosCons2
    },
    comparisonTable,
    swot,
    verdict: {
      winner,
      winnerTitle,
      confidenceScore,
      summary,
      keyDrivers,
      tradeOffSummary,
      recommendedNextSteps
    }
  };
}

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var geminiClient = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return geminiClient;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/analyze", async (req, res) => {
  const { option1, option2, context, language = "ru" } = req.body || {};
  const isEn = language === "en";
  const opt1 = typeof option1 === "string" ? option1.trim() : "";
  const opt2 = typeof option2 === "string" ? option2.trim() : "";
  const ctx = typeof context === "string" ? context.trim() || void 0 : void 0;
  if (!opt1 || !opt2) {
    return res.status(400).json({
      error: isEn ? "Both decision options are required and cannot be empty." : "\u041E\u0431\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B \u0434\u043B\u044F \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F \u0438 \u043D\u0435 \u043C\u043E\u0433\u0443\u0442 \u0431\u044B\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C\u0438."
    });
  }
  try {
    const ai = getGeminiClient();
    if (!ai) {
      const localData = generateLocalAnalysis(opt1, opt2, ctx, language);
      return res.json({
        usingAI: false,
        data: localData,
        message: isEn ? "Generated using built-in decision intelligence engine." : "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u0432\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u0439 \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u043D\u044B\u0439 \u0433\u0435\u043D\u0435\u0440\u0430\u0442\u043E\u0440 \u0430\u043D\u0430\u043B\u0438\u0437\u0430."
      });
    }
    const systemInstruction = isEn ? `You are an elite international authority in Decision Intelligence, strategic management, and applied cognitive psychology.
Your objective: deliver an in-depth, rigorous, objective, and actionable comparative analysis of two alternative decision options provided by the user.

You MUST provide a structured response strictly in English containing 4 core perspectives:
1. A comprehensive list of Pros and Cons for each option with impact weight ratings from 1 (minor) to 5 (critical) and categorized tags.
2. A detailed multi-criteria Direct Comparison matrix evaluating universal dimensions (financial viability, risk exposure, time investment, long-term ROI, execution complexity, psychological alignment) scored 1\u201310 with explanatory notes.
3. A complete 4-quadrant SWOT matrix (Strengths, Weaknesses, Opportunities, Threats) separately for Option 1 and Option 2.
4. An authoritative Verdict recommending the optimal winner ('option1', 'option2', or 'tie'), confidence score (0-100), key deciding drivers, primary trade-off summary, and 3-4 concrete next implementation steps.` : `\u0422\u044B \u2014 \u0432\u0435\u0434\u0443\u0449\u0438\u0439 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0439 \u044D\u043A\u0441\u043F\u0435\u0440\u0442 \u043F\u043E \u0442\u0435\u043E\u0440\u0438\u0438 \u043F\u0440\u0438\u043D\u044F\u0442\u0438\u044F \u0440\u0435\u0448\u0435\u043D\u0438\u0439 (Decision Intelligence), \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u043C\u0443 \u043A\u043E\u043D\u0441\u0430\u043B\u0442\u0438\u043D\u0433\u0443 \u0438 \u043A\u043E\u0433\u043D\u0438\u0442\u0438\u0432\u043D\u043E\u0439 \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u0438.
\u0422\u0432\u043E\u044F \u0446\u0435\u043B\u044C: \u043F\u0440\u043E\u0432\u0435\u0441\u0442\u0438 \u0433\u043B\u0443\u0431\u043E\u043A\u0438\u0439, \u043E\u0431\u044A\u0435\u043A\u0442\u0438\u0432\u043D\u044B\u0439, \u0431\u0435\u0441\u043F\u0440\u0438\u0441\u0442\u0440\u0430\u0441\u0442\u043D\u044B\u0439 \u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u044B\u0439 \u0441\u0440\u0430\u0432\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0437 \u0434\u0432\u0443\u0445 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432 \u0440\u0435\u0448\u0435\u043D\u0438\u0439, \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u043C.

\u041E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u044C \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435, \u0432\u043A\u043B\u044E\u0447\u0430\u044E\u0449\u0438\u0439 3 \u0444\u043E\u0440\u043C\u0430\u0442\u0430 \u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F:
1. \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u044B\u0439 \u0441\u043F\u0438\u0441\u043E\u043A "\u0417\u0430" (Pros) \u0438 "\u041F\u0440\u043E\u0442\u0438\u0432" (Cons) \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0438\u0437 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432 \u0441 \u043E\u0446\u0435\u043D\u043A\u043E\u0439 \u0432\u0435\u0441\u0430 \u0432\u043B\u0438\u044F\u043D\u0438\u044F \u043E\u0442 1 (\u043D\u0435\u0437\u043D\u0430\u0447\u0438\u0442\u0435\u043B\u044C\u043D\u043E) \u0434\u043E 5 (\u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u0430\u0436\u043D\u043E) \u0438 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0435\u0439.
2. \u0414\u0435\u0442\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0443\u044E \u0442\u0430\u0431\u043B\u0438\u0446\u0443 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F \u043F\u043E \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u043C \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u043C \u043A\u0440\u0438\u0442\u0435\u0440\u0438\u044F\u043C (\u0444\u0438\u043D\u0430\u043D\u0441\u044B, \u0440\u0438\u0441\u043A\u0438, \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0435 \u0437\u0430\u0442\u0440\u0430\u0442\u044B, \u0434\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u0430\u044F \u043E\u0442\u0434\u0430\u0447\u0430, \u0441\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438, \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043A\u043E\u043C\u0444\u043E\u0440\u0442) \u0441 \u043E\u0446\u0435\u043D\u043A\u043E\u0439 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u043E\u0442 1 \u0434\u043E 10 \u0438 \u0430\u0440\u0433\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0435\u0439.
3. \u041F\u043E\u043B\u043D\u044B\u0439 SWOT-\u0430\u043D\u0430\u043B\u0438\u0437 (\u0421\u0438\u043B\u044C\u043D\u044B\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B, \u0421\u043B\u0430\u0431\u044B\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B, \u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438, \u0423\u0433\u0440\u043E\u0437\u044B) \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E \u0434\u043B\u044F \u0412\u0430\u0440\u0438\u0430\u043D\u0442\u0430 1 \u0438 \u0412\u0430\u0440\u0438\u0430\u043D\u0442\u0430 2.
4. \u041E\u043A\u043E\u043D\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043E\u0431\u043E\u0441\u043D\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0432\u0435\u0440\u0434\u0438\u043A\u0442 (Verdict): \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F \u043F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044F ('option1' \u0438\u043B\u0438 'option2' \u0438\u043B\u0438 'tie'), \u043F\u0440\u043E\u0446\u0435\u043D\u0442 \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u0438, \u0433\u043B\u0430\u0432\u043D\u044B\u0435 \u0440\u0435\u0448\u0430\u044E\u0449\u0438\u0435 \u0444\u0430\u043A\u0442\u043E\u0440\u044B (keyDrivers), \u043A\u043E\u043C\u043F\u0440\u043E\u043C\u0438\u0441\u0441 (tradeOffSummary) \u0438 3-4 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0445 \u043F\u0435\u0440\u0432\u044B\u0445 \u0448\u0430\u0433\u0430 \u0434\u043B\u044F \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438.`;
    const prompt = isEn ? `Perform a comprehensive multi-framework comparative analysis between these two choices:

OPTION 1: ${option1}
OPTION 2: ${option2}
${context ? `ADDITIONAL CONTEXT & CONSTRAINTS: ${context}` : ""}

Generate the response strictly compliant with the specified JSON schema in English.` : `\u041F\u0440\u043E\u0432\u0435\u0434\u0438 \u0434\u0435\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0432\u0441\u0435\u0441\u0442\u043E\u0440\u043E\u043D\u043D\u0438\u0439 \u0441\u0440\u0430\u0432\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0437 \u0434\u043B\u044F \u0432\u044B\u0431\u043E\u0440\u0430 \u043C\u0435\u0436\u0434\u0443 \u0434\u0432\u0443\u043C\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u043C\u0438 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430\u043C\u0438:

\u0412\u0410\u0420\u0418\u0410\u041D\u0422 1: ${option1}
\u0412\u0410\u0420\u0418\u0410\u041D\u0422 2: ${option2}
${context ? `\u0414\u041E\u041F\u041E\u041B\u041D\u0418\u0422\u0415\u041B\u042C\u041D\u042B\u0419 \u041A\u041E\u041D\u0422\u0415\u041A\u0421\u0422 \u0418 \u041E\u0413\u0420\u0410\u041D\u0418\u0427\u0415\u041D\u0418\u042F: ${context}` : ""}

\u0421\u0444\u043E\u0440\u043C\u0438\u0440\u0443\u0439 \u0430\u043D\u0430\u043B\u0438\u0437 \u0441\u0442\u0440\u043E\u0433\u043E \u0432 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0438 \u0441\u043E \u0441\u0445\u0435\u043C\u043E\u0439 JSON.`;
    const contentConfig = {
      systemInstruction,
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: {
        type: import_genai.Type.OBJECT,
        properties: {
          option1Title: { type: import_genai.Type.STRING },
          option2Title: { type: import_genai.Type.STRING },
          prosCons: {
            type: import_genai.Type.OBJECT,
            properties: {
              option1: {
                type: import_genai.Type.OBJECT,
                properties: {
                  pros: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        id: { type: import_genai.Type.STRING },
                        text: { type: import_genai.Type.STRING },
                        weight: { type: import_genai.Type.INTEGER, description: "1 to 5" },
                        category: { type: import_genai.Type.STRING }
                      },
                      required: ["id", "text", "weight", "category"]
                    }
                  },
                  cons: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        id: { type: import_genai.Type.STRING },
                        text: { type: import_genai.Type.STRING },
                        weight: { type: import_genai.Type.INTEGER, description: "1 to 5" },
                        category: { type: import_genai.Type.STRING }
                      },
                      required: ["id", "text", "weight", "category"]
                    }
                  }
                },
                required: ["pros", "cons"]
              },
              option2: {
                type: import_genai.Type.OBJECT,
                properties: {
                  pros: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        id: { type: import_genai.Type.STRING },
                        text: { type: import_genai.Type.STRING },
                        weight: { type: import_genai.Type.INTEGER, description: "1 to 5" },
                        category: { type: import_genai.Type.STRING }
                      },
                      required: ["id", "text", "weight", "category"]
                    }
                  },
                  cons: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        id: { type: import_genai.Type.STRING },
                        text: { type: import_genai.Type.STRING },
                        weight: { type: import_genai.Type.INTEGER, description: "1 to 5" },
                        category: { type: import_genai.Type.STRING }
                      },
                      required: ["id", "text", "weight", "category"]
                    }
                  }
                },
                required: ["pros", "cons"]
              }
            },
            required: ["option1", "option2"]
          },
          comparisonTable: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                id: { type: import_genai.Type.STRING },
                category: { type: import_genai.Type.STRING },
                title: { type: import_genai.Type.STRING },
                description: { type: import_genai.Type.STRING },
                weight: { type: import_genai.Type.INTEGER, description: "1 to 5" },
                option1Score: { type: import_genai.Type.INTEGER, description: "1 to 10" },
                option1Note: { type: import_genai.Type.STRING },
                option2Score: { type: import_genai.Type.INTEGER, description: "1 to 10" },
                option2Note: { type: import_genai.Type.STRING }
              },
              required: [
                "id",
                "category",
                "title",
                "description",
                "weight",
                "option1Score",
                "option1Note",
                "option2Score",
                "option2Note"
              ]
            }
          },
          swot: {
            type: import_genai.Type.OBJECT,
            properties: {
              option1: {
                type: import_genai.Type.OBJECT,
                properties: {
                  strengths: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  weaknesses: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  opportunities: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  threats: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } }
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"]
              },
              option2: {
                type: import_genai.Type.OBJECT,
                properties: {
                  strengths: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  weaknesses: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  opportunities: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                  threats: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } }
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"]
              }
            },
            required: ["option1", "option2"]
          },
          verdict: {
            type: import_genai.Type.OBJECT,
            properties: {
              winner: { type: import_genai.Type.STRING, description: "option1, option2 or tie" },
              winnerTitle: { type: import_genai.Type.STRING },
              confidenceScore: { type: import_genai.Type.INTEGER, description: "0 to 100" },
              summary: { type: import_genai.Type.STRING },
              keyDrivers: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
              tradeOffSummary: { type: import_genai.Type.STRING },
              recommendedNextSteps: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } }
            },
            required: ["winner", "winnerTitle", "confidenceScore", "summary", "keyDrivers", "tradeOffSummary", "recommendedNextSteps"]
          }
        },
        required: ["option1Title", "option2Title", "prosCons", "comparisonTable", "swot", "verdict"]
      }
    };
    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let parsedData = null;
    let successfulModel = "";
    const MODEL_TIMEOUT_MS = 18e3;
    let isClientDisconnected = false;
    req.on("close", () => {
      isClientDisconnected = true;
    });
    for (const modelName of candidateModels) {
      if (isClientDisconnected) {
        console.log("Client disconnected, aborting AI analysis loop.");
        break;
      }
      const controller = new AbortController();
      let timeoutId = setTimeout(() => {
        controller.abort();
      }, MODEL_TIMEOUT_MS);
      const onReqClose = () => {
        controller.abort();
      };
      req.on("close", onReqClose);
      try {
        const responsePromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            ...contentConfig,
            abortSignal: controller.signal
          }
        });
        const timeoutPromise = new Promise((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new Error(`Model ${modelName} request timed out after ${MODEL_TIMEOUT_MS}ms or was aborted`));
          }, { once: true });
        });
        const response = await Promise.race([responsePromise, timeoutPromise]);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        req.off("close", onReqClose);
        const rawText = response.text?.trim() || "{}";
        parsedData = JSON.parse(rawText);
        if (parsedData && parsedData.option1Title && parsedData.verdict) {
          successfulModel = modelName;
          break;
        }
      } catch (callErr) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        req.off("close", onReqClose);
        controller.abort();
        if (isClientDisconnected || req.destroyed || res.writableEnded) {
          console.log("Client connection closed, stopping candidate evaluation.");
          break;
        }
        const errMsg = String(callErr?.message || callErr);
        const isTimeout = errMsg.includes("timed out") || errMsg.includes("Timeout") || callErr?.name === "AbortError";
        const isTemporary = isTimeout || errMsg.includes("503") || errMsg.includes("demand") || errMsg.includes("429") || errMsg.includes("UNAVAILABLE");
        if (isTimeout) {
          console.warn(`Model ${modelName} timed out after ${MODEL_TIMEOUT_MS}ms, attempting fallback model...`);
        } else if (isTemporary) {
          console.log(`Model ${modelName} temporarily busy (${errMsg}), attempting fallback model...`);
          await new Promise((resolve) => setTimeout(resolve, 600));
        } else {
          console.log(`Notice: Model ${modelName} returned notice (${errMsg}), trying next candidate.`);
        }
      }
    }
    if (parsedData && parsedData.option1Title) {
      return res.json({
        usingAI: true,
        model: successfulModel,
        data: {
          id: "analysis-" + Date.now(),
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          context: context || void 0,
          ...parsedData
        }
      });
    }
    console.log("AI models temporarily unavailable due to demand spikes; engaging expert local fallback.");
    const fallbackData = generateLocalAnalysis(opt1, opt2, ctx, language);
    return res.json({
      usingAI: false,
      data: fallbackData,
      note: isEn ? "Generated by built-in analytical engine" : "\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0432\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u043C \u043C\u043E\u0434\u0443\u043B\u0435\u043C \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0430\u043D\u0430\u043B\u0438\u0437\u0430"
    });
  } catch (error) {
    console.log("Notice: Fallback engine activated for analysis due to error:", error?.message);
    try {
      const fallbackData = generateLocalAnalysis(opt1, opt2, ctx, language);
      return res.json({
        usingAI: false,
        data: fallbackData,
        note: isEn ? "Generated by built-in expert engine" : "\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0432\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u043C \u043C\u043E\u0434\u0443\u043B\u0435\u043C \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u043D\u043E\u0433\u043E \u0430\u043D\u0430\u043B\u0438\u0437\u0430"
      });
    } catch (fallbackError) {
      return res.status(400).json({
        error: fallbackError.message || (isEn ? "Failed to analyze options." : "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0430\u043D\u0430\u043B\u0438\u0437 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432.")
      });
    }
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
