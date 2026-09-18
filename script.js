const timeNode = document.querySelector("#local-time");
const hoverVideos = document.querySelectorAll(".media-link video");
const thinkingTargets = document.querySelectorAll("a, button");
const beforeAfterSliders = document.querySelectorAll("[data-before-after]");
const zoomableImages = Array.from(document.querySelectorAll(".case-detail img"))
  .filter((image) => !image.closest("a") && !image.closest("[data-no-lightbox]") && !image.classList.contains("no-lightbox"));
const scrollHintStrips = document.querySelectorAll(".case-image-strip, .case-more__grid");
const canUseFinePointer = window.matchMedia("(pointer: fine)").matches;
const mobileVideoQuery = window.matchMedia("(max-width: 780px), (hover: none), (pointer: coarse)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const thinkingCursor = canUseFinePointer ? document.createElement("div") : null;
let thinkingStartTime = 0;
let thinkingTimer = 0;
let thinkingDelay = 0;
let imageLightbox = null;
let currentLanguage = "ru";

const languageToggle = document.querySelector("[data-language-toggle]");
const languageStorageKey = "portfolio-language";
const supportedLanguages = ["ru", "en"];
const translatableContentSelector = [
  "main p",
  "main h1",
  "main h2",
  "main h3",
  "main li",
  "main a",
  "main figcaption",
  ".media-caption",
  "[data-language-toggle]",
  "[data-i18n]",
].join(",");
const translatableAttributeNames = ["aria-label", "alt", "title", "placeholder"];

function normalizeTranslationKey(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

const englishTranslations = new Map([
  [`Ярослав — Product Designer`, `Yaroslav — Product Designer`],
  [`EMCD — кейс Ярослава`, `EMCD — Yaroslav Case Study`],
  [`National Factoring Platform — кейс Ярослава`, `National Factoring Platform — Yaroslav Case Study`],
  [`S&P Chat — кейс Ярослава`, `S&P Chat — Yaroslav Case Study`],
  [`S&amp;P Chat — кейс Ярослава`, `S&amp;P Chat — Yaroslav Case Study`],
  [`Навигация`, `Navigation`],
  [`Проекты`, `Projects`],
  [`Переключить язык на английский`, `Switch language to English`],
  [`Написать письмо на design.flayle@mail.ru`, `Email design.flayle@mail.ru`],
  [`Почта`, `Email`],
  [`Вернуться назад`, `Back`],
  [`Смотреть проект`, `View project`],
  [`Проект под NDA`, `Project under NDA`],
  [`Редизайн калькулятора доходности`, `Profitability calculator redesign`],
  [`для покупки майнинг-контракта`, `for purchasing a mining contract`],
  [`Название компании скрыто по NDA`, `Company name withheld under NDA`],
  [`Размытое превью конфиденциального проекта`, `Blurred preview of a confidential project`],
  [`Открыть фигму`, `Open Figma`],
  [`Другие проекты`, `Other Projects`],
  [`Контекст`, `Context`],
  [`Задача`, `Task`],
  [`Дискавери`, `Discovery`],
  [`Результат`, `Outcome`],
  [`Было`, `Before`],
  [`Стало`, `After`],
  [`Бенчмаркинг`, `Benchmarking`],
  [`Инсайты CEO и CPO`, `CEO and CPO Insights`],
  [`Работа с ментором`, `Mentor Collaboration`],
  [`Коридорное тестирование`, `Hallway Testing`],
  [`Первая итерация`, `First Iteration`],
  [`Что проверяли`, `What We Tested`],
  [`Фидбек бизнеса`, `Business Feedback`],
  [`Новая итерация и A/B-тест`, `New Iteration and A/B Test`],
  [`Генерация и концепт`, `Generation and Concept`],
  [`Результаты концептов`, `Concept Results`],
  [`Доработка концепта`, `Concept Refinement`],
  [`Разработка`, `Development`],
  [`Закрыть`, `Close`],
  [`Увеличенное изображение`, `Enlarged image`],
  [`Закрыть увеличенное изображение`, `Close enlarged image`],
  [`Привет, я Ярослав — продуктовый дизайнер. Проектирую сложные интерфейсы в условиях неопределённости: разбираю сценарии, собираю прототипы и <span class="review-highlight">с помощью AI ускоряю путь от гипотезы до запуска</span>.`, `Hi, I’m Yaroslav, a product designer. I design complex interfaces in uncertain conditions: unpack scenarios, build prototypes, and <span class="review-highlight">use AI to speed up the path from hypothesis to launch</span>.`],
  [`Анимировано с помощью Kling`, `Animated with Kling`],
  [`Анимировано с помощью Seedance`, `Animated with Seedance`],
  [`Редизайн калькулятора доходности EMCD для покупки майнинг-контракта`, `Redesigning EMCD’s profitability calculator for buying a mining contract`],
  [`Пересобрал калькулятор под критерии успешного принятия, которые задала компания: сделал сценарий покупки понятнее, добавил состояния и мобильную версию, сохранив визуальный язык продукта.`, `I rebuilt the calculator around the success criteria set by the company: made the purchase flow clearer, added states and a mobile version, while preserving the product’s visual language.`],
  [`UX-переработка MVP факторинговой платформы National Factoring Platform`, `UX redesign of the MVP for the National Factoring Platform`],
  [`S&amp;P Chat: AI-приложение для юридических и налоговых консультаций за 1,5 недели`, `S&amp;P Chat: an AI app for legal and tax consultations in 1.5 weeks`],
  [`Вне клиентских проектов веду свой AI-стартап — прокачиваю продуктовое мышление: гипотезы, приоритизация, метрики, работа с ограничениями.`, `Outside client work, I’m building my own AI startup and sharpening product thinking: hypotheses, prioritization, metrics, and working with constraints.`],
  [`За 1,5 года — 8 продуктов: финтех, юртех, B2B-платформы, mobile, AI`, `In 1.5 years: 8 products across fintech, legal tech, B2B platforms, mobile, and AI`],
  [`<span class="review-highlight">За 1,5 года — 8 продуктов: финтех, юртех, B2B-платформы, mobile, AI</span>`, `<span class="review-highlight">In 1.5 years: 8 products across fintech, legal tech, B2B platforms, mobile, and AI</span>`],
  [`B2 — английский`, `B2 English`],
  [`Краткая информация`, `Quick facts`],
  [`Статьи и продуктовые разборы`, `Articles and Product Teardowns`],
  [`Как я спроектировал нативное соавторство для X`, `How I designed native co-authoring for X`],
  [`Улучшение сценария продажи акций в Т-Инвестициях`, `Improving the stock-selling flow in T-Investments`],
  [`Тестовые задания`, `Test Assignments`],
  [`Концепт мобильного продукта для ТурКарты`, `Mobile product concept for TurCard`],
  [`Переработка карточки анализа сделки для Stobix`, `Redesigning a deal analysis card for Stobix`],
  [`Сервис отслеживания беспилотного такси для T-Bank`, `A self-driving taxi tracking service for T-Bank`],
  [`Калькулятор доходности для покупки майнинг-контракта в EMCD`, `Profitability calculator for buying a mining contract in EMCD`],
  [`EMCD — крипто-экосистема для майнинга, инвестиций и хранения. Калькулятор доходности на hashport.emcd.io перестал справляться со своей задачей по трём причинам: лендинг устарел и визуально выпадал из новых продуктов EMCD, что подрывало доверие к расчётам; формула доходности была непрозрачной, и пользователь не понимал, из чего складывается результат; на этом фоне снижалась конверсия в покупку контракта. Нужно было переосмыслить калькулятор и превратить его в понятный self-checkout: пользователь задаёт параметры контракта, сразу видит прогноз доходности и понимает, какие действия влияют на итоговую сумму.`, `EMCD is a crypto ecosystem for mining, investing, and storage. The profitability calculator on hashport.emcd.io had stopped doing its job for three reasons: the landing page was outdated and visually disconnected from newer EMCD products, which hurt trust in the calculations; the profitability formula was opaque, so users could not understand what shaped the result; and conversion into contract purchases was dropping. The task was to rethink the calculator and turn it into a clear self-checkout: users set contract parameters, immediately see a profitability forecast, and understand which actions affect the final amount.`],
  [`Обновить UX и UI калькулятора: пересобрать ввод данных, состояния, расчёт доходности и мобильный сценарий так, чтобы решение легло в визуальный язык EMCD даже без доступа к полноценной дизайн-системе.`, `Update the calculator’s UX and UI: rebuild data input, states, profitability calculation, and the mobile flow so the solution fits EMCD’s visual language even without access to a complete design system.`],
  [`Я начал с разбора сценария покупки контракта и изучил, как похожие калькуляторы устроены в финтехе и криптопродуктах. Отдельно отметил точки потери доверия: непрозрачную формулу расчёта, скрытые ограничения, резкую смену валюты, неочевидный CTA и слабый мобильный сценарий.`, `I started by breaking down the contract purchase flow and studying how similar calculators work in fintech and crypto products. I separately marked the trust-breaking points: an opaque calculation formula, hidden constraints, abrupt currency changes, an unclear CTA, and a weak mobile flow.`],
  [`После этого собрал референсы интерфейсов, где калькулятор работает не как декоративный блок, а как главный инструмент принятия решения.`, `After that, I collected interface references where the calculator works not as decoration, but as the main decision-making tool.`],
  [`В low-fidelity я проверил основную механику: как пользователь выбирает мощность, срок и валюту, где видит пересчёт доходности и в какой момент переходит к покупке. На этом же этапе заложил пустые, ошибочные и загрузочные состояния, чтобы сценарий не разваливался на краевых случаях.`, `In low fidelity, I tested the core mechanics: how users choose power, term, and currency, where they see profitability recalculation, and when they move to purchase. At this stage, I also planned empty, error, and loading states so the flow would not break on edge cases.`],
  [`Мобильную версию проектировал параллельно, потому что для такого сценария нельзя просто сжать десктоп: калькулятор должен оставаться читаемым и управляемым одним большим пальцем.`, `I designed the mobile version in parallel because this flow cannot simply be squeezed from desktop: the calculator must remain readable and controllable with one thumb.`],
  [`После согласования структуры я собрал high-fidelity-версию на базе уже запущенных интерфейсов EMCD: тёмная среда, зелёный акцент доходности, фиолетовый CTA и компактные контролы. Так решение сохранило ощущение продукта без попытки заново изобретать дизайн-систему.`, `After aligning the structure, I built the high-fidelity version based on already launched EMCD interfaces: a dark environment, green profitability accents, a purple CTA, and compact controls. This helped the solution keep the product feel without trying to reinvent the design system.`],
  [`Получился цельный self-checkout для покупки виртуального майнинг-контракта: пользователь задаёт мощность, срок и валюту, сразу видит прогноз доходности до оплаты и понимает, как каждый параметр влияет на итог. Расчёт стал прозрачным — исчезла главная точка потери доверия. Макет покрывает ключевые состояния (empty, loading, error, disabled), отдельный мобильный поток и <span class="review-highlight">готов к передаче в разработку</span>.`, `The result is a complete self-checkout for buying a virtual mining contract: users set power, term, and currency, instantly see the profitability forecast before payment, and understand how each parameter affects the outcome. The calculation became transparent, removing the main trust gap. The design covers key states (empty, loading, error, disabled), a separate mobile flow, and is <span class="review-highlight">ready for development handoff</span>.`],
  [`Продовых данных по конверсии нет, поэтому фиксирую критерии успеха: меньше шагов до результата, понятная формула доходности, закрытые краевые состояния и рабочий сценарий с телефона.`, `There is no production conversion data, so I frame success through product criteria: fewer steps to the result, a clear profitability formula, covered edge states, and a working mobile flow.`],
  [`Команда Tekmates пригласила меня подключиться к переработке UX факторинговой платформы под кураторством старшего продуктового дизайнера. Задача была не в косметическом редизайне, а в усилении рабочего интерфейса для пользователей с разными ролями.`, `The Tekmates team invited me to join the UX redesign of a factoring platform under the guidance of a senior product designer. The task was not a cosmetic redesign, but strengthening a working interface for users with different roles.`],
  [`Перед переработкой MVP протестировали на собственных сотрудниках компании и собрали две главные боли: путаную навигацию — пользователи не понимали, где находятся и как вернуться к нужному разделу, — и нехватку статусов, из-за которой было непонятно, на каком этапе находится операция. Отсюда и задача: пересобрать навигацию и систему статусов, а не просто обновить визуал.`, `Before the redesign, the MVP was tested on company employees and revealed two main pains: confusing navigation, where users did not understand where they were or how to return to the needed section, and a lack of statuses, which made the stage of an operation unclear. So the task was to rebuild navigation and the status system, not just refresh the visuals.`],
  [`Пересобрать ключевые сценарии MVP: навигацию, работу с заявками, статусы, финансовые сущности и представление данных так, чтобы пользователи быстрее понимали, где они находятся и какое действие нужно сделать дальше.`, `Rebuild the MVP’s key flows: navigation, work with applications, statuses, financial entities, and data presentation so users understand faster where they are and what action comes next.`],
  [`Исследование строил вокруг трёх ролей, которые смотрят на один продукт по-разному: операционная команда, клиенты и должники. Отправной точкой стал внутренний тест на сотрудниках компании — он дал первые боли по навигации и статусам.`, `I structured the research around three roles that look at the same product differently: operations team, clients, and debtors. The starting point was an internal test with company employees, which surfaced the first navigation and status pains.`],
  [`Дальше проверял гипотезы коридорным тестированием на живых задачах: пополнить счёт, найти и закрыть заявку на финансирование, описать, чего не хватает на главном. В финальной итерации в проверке участвовали 10 респондентов — по ним и замеряли, насколько самостоятельно люди справляются со сценариями.`, `Then I tested hypotheses through hallway testing on real tasks: top up an account, find and close a financing application, and describe what was missing on the home screen. In the final iteration, 10 respondents participated, and we measured how independently people completed the scenarios.`],
  [`Я посмотрел, как похожие продукты работают с большим количеством финансовых сущностей. В большинстве решений интерфейс держится на трёх опорах:`, `I looked at how similar products handle many financial entities. In most solutions, the interface rests on three pillars:`],
  [`таблицы как основной рабочий инструмент;`, `tables as the main working tool;`],
  [`диаграммы и сводки для быстрого понимания состояния бизнеса;`, `charts and summaries for quickly understanding business state;`],
  [`системность: одинаковые паттерны фильтрации, статусов и действий.`, `system consistency: shared patterns for filtering, statuses, and actions.`],
  [`Это помогло не промахнуться с ожиданиями аудитории и не делать интерфейс, который выглядит современно, но ломает привычный рабочий процесс.`, `This helped align with audience expectations and avoid building an interface that looks modern but breaks the familiar workflow.`],
  [`Клиенты часто работают с платформой на ходу, поэтому мобильная веб-версия важна для загрузки счётов, просмотра статусов и быстрых уведомлений.`, `Clients often work with the platform on the go, so the mobile web version matters for uploading invoices, checking statuses, and getting quick notifications.`],
  [`Один общий интерфейс может путать роли, поэтому стоит разделять порталы для операционной команды, клиентов и должников.`, `One shared interface can confuse roles, so it is worth separating portals for the operations team, clients, and debtors.`],
  [`Проектные решения делал сам: навигацию, структуру разделов, таблицы, систему статусов, пустые и загрузочные состояния, первую итерацию на Ant Design. Старший дизайнер выступал ментором — проверял мои решения и давал комментарии. Часть решений после ревью я дорабатывал, но больше 70% проходили апрув в моём варианте. За ментором оставались стратегическая рамка и презентация бизнесу, за мной — само проектирование интерфейса.`, `I made the design decisions myself: navigation, section structure, tables, status system, empty and loading states, and the first Ant Design-based iteration. The senior designer acted as a mentor, reviewing my decisions and giving feedback. I refined some solutions after review, but more than 70% were approved in my version. The mentor owned the strategic framing and business presentation, while I owned the interface design itself.`],
  [`Для проверки навигации мы дали пользователям несколько рабочих задач:`, `To test navigation, we gave users several working tasks:`],
  [`перейти в кошелёк и пополнить счёт;`, `go to the wallet and top up the account;`],
  [`описать, чего не хватает на главном экране;`, `describe what is missing on the home screen;`],
  [`найти заявки на финансирование и закрыть одну из них.`, `find financing applications and close one of them.`],
  [`Первую версию я собирал с опорой на Ant Design, чтобы ускорить вывод MVP и сохранить предсказуемость интерфейса. Основной акцент сделал на структуре разделов, таблицах, карточках статусов и понятных пустых состояниях.`, `I built the first version with Ant Design to speed up MVP delivery and keep the interface predictable. The main focus was section structure, tables, status cards, and clear empty states.`],
  [`После первой итерации мы смотрели, насколько быстро пользователи ориентируются в заявках, понимают состояние финансирования и находят действия без подсказок от команды.`, `After the first iteration, we checked how quickly users navigated applications, understood financing status, and found actions without hints from the team.`],
  [`Бизнес подтвердил выбранную логику, поэтому мы продолжили работу: провели UX-аудит вместе с представителем компании, уточнили спорные места и подготовили новую итерацию интерфейса.`, `The business confirmed the chosen logic, so we continued: ran a UX audit with a company representative, clarified disputed points, and prepared a new interface iteration.`],
  [`Рост частоты повторного пополнения на 10% — результат A/B-теста на сотрудниках компании за неделю: сравнивали старую и новую версию сценария пополнения счёта.`, `A 10% increase in repeat top-up frequency came from a one-week A/B test with company employees, comparing the old and new account top-up flow.`],
  [`Повторным пополнением считали второе и последующие пополнения одним пользователем за период теста.`, `Repeat top-up meant the second and following top-ups made by one user during the test period.`],
  [`MVP получил более цельный и системный интерфейс: роли разведены понятнее, ключевые сценарии стали быстрее, а решения подтверждены пользовательскими проверками и бизнесом.`, `The MVP received a more cohesive and systematic interface: roles became clearer, key flows became faster, and the decisions were validated by user checks and the business.`],
  [`частота повторного пополнения счёта выросла на 10%;`, `repeat account top-up frequency increased by 10%;`],
  [`8 из 10 пользователей самостоятельно справились с работой с заявками`, `8 out of 10 users independently completed application-related tasks`],
  [`<span class="review-highlight">8 из 10 пользователей самостоятельно справились с работой с заявками</span>: нашли раздел заявок, поняли статус финансирования и закрыли заявку без подсказок от команды;`, `<span class="review-highlight">8 out of 10 users independently completed application-related tasks</span>: they found the applications section, understood financing status, and closed an application without hints from the team;`],
  [`платформа стала лучше подготовлена к масштабированию на разные роли и порталы.`, `the platform became better prepared to scale across different roles and portals.`],
  [`S&amp;P Chat — AI-приложение для налоговых и юридических консультаций`, `S&amp;P Chat: an AI app for tax and legal consultations`],
  [`Команда S&amp;P — немецкого объединения Schippke &amp; Partners — пришла с идеей mobile-first AI-приложения для налоговых и юридических консультаций на немецком и английском языках. Продукт планировался как самостоятельный сервис с будущей интеграцией в Schippke OS.`, `The S&amp;P team, part of the German association Schippke &amp; Partners, came with the idea of a mobile-first AI app for tax and legal consultations in German and English. The product was planned as a standalone service with future integration into Schippke OS.`],
  [`Сроки были сжатыми: за 1,5 недели нужно было пройти путь от первого обсуждения до прототипа, тестирования, доработок и <span class="review-highlight">закрытого релиза в App Store</span>.`, `The timeline was tight: in 1.5 weeks we had to go from the first discussion to a prototype, testing, refinements, and a <span class="review-highlight">closed App Store release</span>.`],
  [`Собрать интерактивный прототип, используя AI как инструмент ускорения — от макета к рабочему коду, — при этом самому отвечая за сценарии, логику и визуальные решения.`, `Build an interactive prototype using AI as an acceleration tool, from design to working code, while personally owning the scenarios, logic, and visual decisions.`],
  [`Сначала я разобрал, как устроены AI-чаты и агенты у лидеров рынка: Perplexity, ChatGPT, Linear, Notion, Arc и Superhuman. Смотрел не на визуальный шум, а на паттерны, которые помогают пользователю быстро сформулировать запрос, доверять ответу и не теряться в истории диалога.`, `First, I analyzed how AI chats and agents work in leading products: Perplexity, ChatGPT, Linear, Notion, Arc, and Superhuman. I looked not at visual noise, but at patterns that help users quickly formulate a request, trust the answer, and stay oriented in conversation history.`],
  [`Из исследования собрал короткую UX-заметку: какие сценарии нужны в первом прототипе, как должен вести себя чат, где пригодится deep search, как показать голосовой ввод и как не перегрузить mobile-first интерфейс.`, `From the research, I wrote a short UX note: which scenarios the first prototype needed, how the chat should behave, where deep search would help, how to show voice input, and how not to overload a mobile-first interface.`],
  [`Юридические и налоговые консультации — зона риска, поэтому я закладывал в интерфейс защиту от слепого доверия: ответ подаётся как документ со ссылками, а не как вердикт, и сценарий подталкивает уточнять. За корректность отвечает AI-модель, содержательная ответственность — на стороне заказчика.`, `Legal and tax consultations are a risk area, so I built protection against blind trust into the interface: the answer is presented as a document with references, not as a verdict, and the flow encourages clarification. The AI model is responsible for correctness, while content responsibility stays with the client.`],
  [`После дискавери я разделил работу на два параллельных потока: рабочую основу и визуальную проработку. Я задавал Cursor промпты с чёткими UX-ограничениями — то есть AI собирал каркас по моим правилам, — а сам параллельно проектировал визуальный язык, тёмную тему, типографику и подачу ответа как структурированного документа.`, `After discovery, I split the work into two parallel tracks: the functional base and visual exploration. I gave Cursor prompts with clear UX constraints, so AI assembled the structure by my rules, while I designed the visual language, dark theme, typography, and answer presentation as a structured document.`],
  [`Так я мог проверять свои решения сразу в интерактиве, а не зависать в статичных макетах. Для такого сжатого проекта это было критично: дизайн и прототип двигались одновременно, но направление всегда задавал я, а AI ускорял сборку.`, `This let me test decisions immediately in an interactive prototype instead of getting stuck in static mockups. For such a compressed project, that was critical: design and prototype moved at the same time, but I always set the direction while AI accelerated assembly.`],
  [`На первой итерации я показал заказчику несколько направлений. Лучше всего сработал вариант, где строгая чёрно-белая основа соединялась с выразительными акцентами и mobile-first навигацией.`, `In the first iteration, I showed the client several directions. The strongest option combined a strict black-and-white base with expressive accents and mobile-first navigation.`],
  [`Этот концепт стал базой для дальнейшей проработки экранов, пользовательских сценариев и сборки прототипа под тест.`, `This concept became the basis for further screen work, user flows, and prototype assembly for testing.`],
  [`Вместе с заказчиком мы собрали документ требований и прошлись по концепту, чтобы найти UX-недочёты до сборки. После этого я доработал флоу: главный экран, чат, deep search, историю, профиль, голосовой сценарий и онбординг.`, `Together with the client, we assembled a requirements document and reviewed the concept to find UX gaps before implementation. After that, I refined the flow: home screen, chat, deep search, history, profile, voice scenario, and onboarding.`],
  [`К середине работы был готов цельный набор экранов, на котором можно было собирать прототип и проверять продукт на живых сценариях.`, `By the middle of the project, a complete set of screens was ready, making it possible to assemble the prototype and test the product on real scenarios.`],
  [`Когда макеты и флоу стали плотными, я перешёл к сборке прототипа. Использовал Codex с доступом к Figma через MCP, чтобы код опирался прямо на мои макеты, а не на пересказ интерфейса словами.`, `When the mockups and flows became solid, I moved to prototype assembly. I used Codex with Figma access through MCP so the code was based directly on my designs, not on a verbal retelling of the interface.`],
  [`Я задавал структуру, промпты и ограничения, проверял каждый результат в браузере, ловил расхождения с дизайном и правил их вручную. AI ускорял путь от макета до кода — но что и как должно работать, решал я. Довёл прототип до состояния, которое можно показать пользователям и передать команде.`, `I defined the structure, prompts, and constraints, checked every result in the browser, caught design mismatches, and fixed them manually. AI accelerated the path from mockup to code, but I decided what should work and how. I brought the prototype to a state ready to show users and hand over to the team.`],
  [`Полторы недели легли так: день на дискавери, два-три на концепт и визуал, один на требования, два на флоу, два на сборку прототипа — и релиз.`, `The 1.5 weeks broke down like this: one day for discovery, two to three for concept and visuals, one for requirements, two for flows, two for prototype assembly, and release.`],
  [`За 1,5 недели мы прошли путь от первого звонка до закрытого релиза в App Store. Я собрал рабочий mobile-first прототип AI-приложения, который подтвердил направление продукта и открылся первым пользователям по инвайтам. AI ускорил путь от макета к коду, но продуктовые и дизайнерские решения — ключевые сценарии, UX-паттерны чата и deep search, визуальный язык — оставались за мной. Команда получила репозиторий и понятную основу для следующего этапа и продолжила разработку на его базе.`, `In 1.5 weeks, we went from the first call to a closed App Store release. I built a working mobile-first prototype of the AI app, which validated the product direction and opened to first users by invite. AI accelerated the path from design to code, but product and design decisions, including key scenarios, chat and deep search UX patterns, and the visual language, remained mine. The team received a repository and a clear base for the next stage, then continued development from it.`],
  [`Открыть проект EMCD`, `Open EMCD project`],
  [`Открыть проект National Factoring Platform`, `Open National Factoring Platform project`],
  [`Открыть проект S&P Chat`, `Open S&P Chat project`],
  [`Открыть статью о нативном соавторстве для X`, `Open the article about native co-authoring for X`],
  [`Открыть статью про Т-Инвестиции`, `Open the article about T-Investments`],
  [`Открыть фигму ТурКарта`, `Open the TurCard Figma file`],
  [`Открыть фигму карточки анализа сделки Stobix`, `Open the Stobix deal analysis card Figma file`],
  [`Открыть фигму сервиса беспилотного такси`, `Open the self-driving taxi service Figma file`],
  [`Калькулятор доходности EMCD на ноутбуке`, `EMCD profitability calculator on a laptop`],
  [`Факторинговая платформа на ноутбуке`, `Factoring platform on a laptop`],
  [`Мобильное приложение в руке`, `Mobile app in hand`],
  [`Ярослав за работой над стартапом`, `Yaroslav working on a startup`],
  [`Концепт соавторства для X`, `Co-authoring concept for X`],
  [`Сценарий продажи акций в Т-Инвестициях`, `Stock-selling flow in T-Investments`],
  [`Мобильный интерфейс ТурКарта`, `TurCard mobile interface`],
  [`Карточка анализа сделки Stobix`, `Stobix deal analysis card`],
  [`Сервис отслеживания беспилотного такси`, `Self-driving taxi tracking service`],
  [`Анимация калькулятора доходности EMCD`, `Animation of the EMCD profitability calculator`],
  [`Описание проекта EMCD`, `EMCD project description`],
  [`Сравнение первого и обновлённого варианта калькулятора`, `Comparison of the first and updated calculator versions`],
  [`Проведите, чтобы сравнить было и стало`, `Drag to compare before and after`],
  [`Дискавери и референсы`, `Discovery and references`],
  [`Доска с исследованием сценария калькулятора`, `Board with calculator flow research`],
  [`Доска с UI и UX референсами калькуляторов`, `Board with UI and UX calculator references`],
  [`Low-fidelity мобильный сценарий калькулятора EMCD`, `Low-fidelity mobile flow for the EMCD calculator`],
  [`Финальный интерфейс калькулятора`, `Final calculator interface`],
  [`Финальный интерфейс калькулятора EMCD`, `Final EMCD calculator interface`],
  [`Экран результата расчёта доходности EMCD`, `EMCD profitability result screen`],
  [`Расширенный вариант калькулятора EMCD`, `Expanded EMCD calculator version`],
  [`Компактный вариант калькулятора EMCD`, `Compact EMCD calculator version`],
  [`Анимация кейса National Factoring Platform`, `National Factoring Platform case animation`],
  [`Описание проекта National Factoring Platform`, `National Factoring Platform project description`],
  [`MVP и первые ориентиры`, `MVP and first references`],
  [`Экран MVP факторинговой платформы`, `Factoring platform MVP screen`],
  [`Визуальный ориентир для интерфейса платформы`, `Visual reference for the platform interface`],
  [`Исследование и бенчмаркинг`, `Research and benchmarking`],
  [`Разбор пользовательских сценариев факторинговой платформы`, `Factoring platform user-flow breakdown`],
  [`Бенчмаркинг интерфейсов факторинга и финансовых платформ`, `Benchmarking factoring and financial platform interfaces`],
  [`Презентация UX-решений ментору и бизнесу`, `Presentation of UX solutions to the mentor and business`],
  [`Первая итерация интерфейса`, `First interface iteration`],
  [`Первая итерация интерфейса факторинговой платформы`, `First iteration of the factoring platform interface`],
  [`Экран первой итерации с пустым состоянием`, `First iteration screen with an empty state`],
  [`Экран первой итерации с состоянием загрузки`, `First iteration screen with a loading state`],
  [`Фидбек бизнеса по новой итерации продукта`, `Business feedback on the new product iteration`],
  [`Финальные экраны факторинговой платформы`, `Final screens of the factoring platform`],
  [`Финальный экран платформы с заявками`, `Final platform screen with applications`],
  [`Финальный экран с деталями финансирования`, `Final screen with financing details`],
  [`Финальный экран создания заявки`, `Final application creation screen`],
  [`Финальный экран списка документов`, `Final document list screen`],
  [`Финальный экран статусов`, `Final status screen`],
  [`Финальный экран таблицы операций`, `Final operations table screen`],
  [`Финальный экран параметров заявки`, `Final application parameters screen`],
  [`Анимация мобильного AI-приложения S&P Chat`, `Animation of the S&P Chat mobile AI app`],
  [`Описание проекта S&P Chat`, `S&P Chat project description`],
  [`Генерация и первые концепты S&P Chat`, `Generation and first S&P Chat concepts`],
  [`Первый визуальный концепт S&P Chat`, `First visual concept for S&P Chat`],
  [`Альтернативный визуальный концепт S&P Chat`, `Alternative visual concept for S&P Chat`],
  [`Широкая доска с вариантами концепта S&P Chat`, `Wide board with S&P Chat concept variants`],
  [`Флоу и доработка экранов S&P Chat`, `S&P Chat flows and screen refinement`],
  [`Основной экран и чат S&P Chat`, `S&P Chat home screen and chat`],
  [`Экран чата и deep search`, `Chat and deep search screen`],
  [`Альтернативный экран deep search`, `Alternative deep search screen`],
  [`Переходы к истории и профилю`, `Transitions to history and profile`],
  [`Голосовой сценарий в S&P Chat`, `Voice scenario in S&P Chat`],
  [`Онбординг S&P Chat`, `S&P Chat onboarding`],
  [`Переход с главного экрана к discovery-сценарию`, `Transition from the home screen to the discovery scenario`],
  [`Разработка прототипа S&P Chat`, `S&P Chat prototype development`],
  [`Визуальный блок разработки прототипа S&P Chat`, `Visual block for S&P Chat prototype development`],
].map(([original, translated]) => [normalizeTranslationKey(original), translated]));

if (thinkingCursor) {
  thinkingCursor.className = "thinking-cursor";
  thinkingCursor.setAttribute("aria-hidden", "true");
  document.body.append(thinkingCursor);
}

function translateOriginal(value, language = currentLanguage) {
  if (language !== "en") {
    return value;
  }

  return englishTranslations.get(normalizeTranslationKey(value)) || value;
}

function getStoredLanguage() {
  try {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);
    return supportedLanguages.includes(storedLanguage) ? storedLanguage : "";
  } catch {
    return "";
  }
}

function getBrowserLanguage() {
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return browserLanguages.some((language) => String(language).toLowerCase().startsWith("en")) ? "en" : "ru";
}

function getInitialLanguage() {
  return getStoredLanguage() || getBrowserLanguage();
}

function persistLanguage(language) {
  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
  }
}

function updateLanguageToggle(language) {
  if (!languageToggle) {
    return;
  }

  const nextLanguage = language === "en" ? "ru" : "en";
  languageToggle.textContent = nextLanguage === "en" ? "English" : "Русский";
  languageToggle.setAttribute(
    "aria-label",
    nextLanguage === "en" ? "Переключить язык на английский" : "Switch language to Russian",
  );
}

function translateContent(language) {
  document.querySelectorAll(translatableContentSelector).forEach((element) => {
    if (!element.__i18nOriginalHtml) {
      element.__i18nOriginalHtml = element.innerHTML;
    }

    const original = element.__i18nOriginalHtml;
    const translation = englishTranslations.get(normalizeTranslationKey(original));

    if (!translation) {
      return;
    }

    element.innerHTML = language === "en" ? translation : original;
  });
}

function translateAttributes(language) {
  document.querySelectorAll(translatableAttributeNames.map((name) => `[${name}]`).join(",")).forEach((element) => {
    if (!element.__i18nOriginalAttributes) {
      element.__i18nOriginalAttributes = {};
    }

    translatableAttributeNames.forEach((attributeName) => {
      if (!element.hasAttribute(attributeName)) {
        return;
      }

      if (!element.__i18nOriginalAttributes[attributeName]) {
        element.__i18nOriginalAttributes[attributeName] = element.getAttribute(attributeName);
      }

      const original = element.__i18nOriginalAttributes[attributeName];
      const translation = englishTranslations.get(normalizeTranslationKey(original));

      if (!translation) {
        return;
      }

      element.setAttribute(attributeName, language === "en" ? translation : original);
    });
  });
}

function applyLanguage(language, shouldPersist = false) {
  const normalizedLanguage = supportedLanguages.includes(language) ? language : "ru";
  currentLanguage = normalizedLanguage;

  if (!document.documentElement.__i18nOriginalTitle) {
    document.documentElement.__i18nOriginalTitle = document.title;
  }

  document.documentElement.lang = normalizedLanguage;
  document.title = translateOriginal(document.documentElement.__i18nOriginalTitle, normalizedLanguage);
  translateContent(normalizedLanguage);
  translateAttributes(normalizedLanguage);
  updateLanguageToggle(normalizedLanguage);

  if (normalizedLanguage === "ru") {
    setupNoDanglingShortWords();
  }

  if (shouldPersist) {
    persistLanguage(normalizedLanguage);
  }
}

function setupLanguageSwitcher() {
  applyLanguage(getInitialLanguage());

  if (!languageToggle) {
    return;
  }

  languageToggle.addEventListener("click", () => {
    applyLanguage(currentLanguage === "en" ? "ru" : "en", true);
  });
}

function updateLocalTime() {
  if (!timeNode) {
    return;
  }

  const now = new Date();
  const value = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  timeNode.textContent = value;
  timeNode.dateTime = now.toISOString();
}

function setupHoverVideos() {
  const resetVideo = (video) => {
    try {
      video.currentTime = 0;
    } catch {
    }
  };

  const syncMobileVideoMode = () => {
    hoverVideos.forEach((video) => {
      const mediaLink = video.closest(".media-link");

      if (!mediaLink) {
        return;
      }

      if (mobileVideoQuery.matches) {
        video.preload = "auto";
        mediaLink.classList.add("is-video-active");
        video.play().catch(() => {
        });
        return;
      }

      video.pause();
      resetVideo(video);
      mediaLink.classList.remove("is-video-active");
    });
  };

  hoverVideos.forEach((video) => {
    const mediaLink = video.closest(".media-link");
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    if (!mediaLink) {
      return;
    }

    mediaLink.addEventListener("mouseenter", () => {
      if (mobileVideoQuery.matches) {
        return;
      }

      resetVideo(video);
      mediaLink.classList.add("is-video-active");
      video.play().catch(() => {
        mediaLink.classList.remove("is-video-active");
      });
    });

    mediaLink.addEventListener("mouseleave", () => {
      if (mobileVideoQuery.matches) {
        return;
      }

      video.pause();
      resetVideo(video);
      mediaLink.classList.remove("is-video-active");
    });
  });

  syncMobileVideoMode();

  if (typeof mobileVideoQuery.addEventListener === "function") {
    mobileVideoQuery.addEventListener("change", syncMobileVideoMode);
  } else {
    mobileVideoQuery.addListener(syncMobileVideoMode);
  }
}

function setupThinkingCursor() {
  if (!thinkingCursor) {
    return;
  }

  const renderCursorText = (value) => {
    thinkingCursor.replaceChildren();

    value.split("").forEach((letter, index) => {
      const span = document.createElement("span");
      span.textContent = letter === " " ? "\u00a0" : letter;
      span.style.setProperty("--letter-index", index);
      thinkingCursor.append(span);
    });
  };

  const updateWorkedText = () => {
    const seconds = Math.max(2, Math.floor((Date.now() - thinkingStartTime) / 1000));
    renderCursorText(`Worked for ${seconds}s...`);
  };

  const updateCursor = (event) => {
    thinkingCursor.style.setProperty("--cursor-x", `${event.clientX}px`);
    thinkingCursor.style.setProperty("--cursor-y", `${event.clientY}px`);
  };

  thinkingTargets.forEach((target) => {
    target.addEventListener("mouseenter", (event) => {
      thinkingStartTime = Date.now();
      clearTimeout(thinkingDelay);
      clearInterval(thinkingTimer);
      renderCursorText("Thinking...");
      thinkingDelay = setTimeout(() => {
        updateWorkedText();
        thinkingTimer = setInterval(updateWorkedText, 1000);
      }, 2000);

      document.body.classList.add("is-thinking");
      updateCursor(event);
    });

    target.addEventListener("mousemove", updateCursor);

    target.addEventListener("mouseleave", () => {
      clearTimeout(thinkingDelay);
      clearInterval(thinkingTimer);
      document.body.classList.remove("is-thinking");
    });
  });
}

function setupScrollHintStrips() {
  if (!scrollHintStrips.length || reducedMotionQuery.matches) {
    return;
  }

  const nudgeStrip = (strip) => {
    const maxScroll = strip.scrollWidth - strip.clientWidth;

    if (maxScroll <= 0 || strip.dataset.hintPlayed === "true") {
      return;
    }

    strip.dataset.hintPlayed = "true";
    const hintDistance = Math.min(160, maxScroll * 0.18);

    window.setTimeout(() => {
      strip.scrollTo({
        left: hintDistance,
        behavior: "smooth",
      });

      window.setTimeout(() => {
        strip.scrollTo({
          left: Math.max(0, hintDistance * 0.45),
          behavior: "smooth",
        });
      }, 760);
    }, 240);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        nudgeStrip(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.35,
    });

    scrollHintStrips.forEach((strip) => observer.observe(strip));
    return;
  }

  scrollHintStrips.forEach(nudgeStrip);
}

function setupBeforeAfterSliders() {
  beforeAfterSliders.forEach((slider) => {
    const range = slider.querySelector(".before-after__range");

    if (!range) {
      return;
    }

    const setPosition = (value) => {
      const position = Math.min(100, Math.max(0, Number(value)));
      slider.style.setProperty("--position", `${position}%`);
      range.value = String(position);
    };

    range.addEventListener("input", () => setPosition(range.value));
    range.addEventListener("change", () => setPosition(range.value));
    setPosition(range.value);
  });
}

function setupNoDanglingShortWords() {
  const contentRoot = document.querySelector("main");

  if (!contentRoot) {
    return;
  }

  const shortWordPattern = /(^|[\s([{«„"“])([АаВвИиКкОоСсУуЯя]|[Бб]ез|[Вв]о|[Дд]о|[Дд]ля|[Зз]а|[Ии]з|[Кк]ак|[Мм]ы|[Нн]а|[Нн]е|[Нн]о|[Оо]б|[Оо]т|[Пп]о|[Пп]ри|[Пп]ро|[Сс]о|[Чч]то|[Ээ]то)\s+/g;
  const walker = document.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    node.nodeValue = node.nodeValue.replace(shortWordPattern, "$1$2\u00a0");
  });
}

function setupRevealAnimations() {
  const revealSelectors = [
    ".site-header > *",
    ".hero-project > *",
    ".project-grid .project-card",
    ".about--visual",
    ".section-title",
    ".article-preview",
    ".case-detail__hero",
    ".case-before-after",
    ".case-image-grid",
    ".case-image-strip",
    ".case-media-wide",
    ".case-row",
    ".case-more > *",
    ".footer > *",
  ];
  const revealItems = Array.from(document.querySelectorAll(revealSelectors.join(",")));

  if (!revealItems.length) {
    return;
  }

  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        return;
      }

      entry.target.classList.remove("is-revealed");
    });
  }, {
    rootMargin: "18% 0px 18% 0px",
    threshold: 0.01,
  });

  revealItems.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 90}ms`);
    observer.observe(item);
  });
}

function setupImageLightbox() {
  if (!zoomableImages.length) {
    return;
  }

  const closeLightbox = () => {
    if (!imageLightbox) {
      return;
    }

    const currentLightbox = imageLightbox;
    currentLightbox.classList.remove("is-open");
    document.body.classList.remove("is-lightbox-open");
    window.setTimeout(() => {
      currentLightbox.remove();

      if (imageLightbox === currentLightbox) {
        imageLightbox = null;
      }
    }, 180);
  };

  const openLightbox = (image) => {
    closeLightbox();

    imageLightbox = document.createElement("div");
    imageLightbox.className = "image-lightbox";
    imageLightbox.setAttribute("role", "dialog");
    imageLightbox.setAttribute("aria-modal", "true");
    imageLightbox.setAttribute("aria-label", image.alt || translateOriginal("Увеличенное изображение"));

    const lightboxImage = document.createElement("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "";
    lightboxImage.decoding = "async";

    const closeButton = document.createElement("button");
    closeButton.className = "image-lightbox__close";
    closeButton.type = "button";
    closeButton.textContent = translateOriginal("Закрыть");
    closeButton.setAttribute("aria-label", translateOriginal("Закрыть увеличенное изображение"));
    closeButton.addEventListener("click", closeLightbox);

    imageLightbox.append(lightboxImage, closeButton);
    imageLightbox.addEventListener("click", (event) => {
      if (event.target === imageLightbox) {
        closeLightbox();
      }
    });

    document.body.append(imageLightbox);
    document.body.classList.add("is-lightbox-open");
    window.requestAnimationFrame(() => {
      imageLightbox.classList.add("is-open");
      closeButton.focus({ preventScroll: true });
    });
  };

  zoomableImages.forEach((image) => {
    image.classList.add("is-zoomable-image");
    image.addEventListener("click", () => openLightbox(image));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}

setupHoverVideos();
setupThinkingCursor();
setupScrollHintStrips();
setupBeforeAfterSliders();
setupLanguageSwitcher();
setupNoDanglingShortWords();
setupRevealAnimations();
setupImageLightbox();
updateLocalTime();
setInterval(updateLocalTime, 30_000);
