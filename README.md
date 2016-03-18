# Kafkatist (Фото квест) 
### Сайт: [kafkatist.herokuapp.com](http://kafkatist.herokuapp.com)
[![Build Status](https://travis-ci.org/urfu-2015/team3.svg?branch=master)](https://travis-ci.org/urfu-2015/team3)

## Мы используем:
1. [Waffle](https://waffle.io/urfu-2015/team3) для задач
2. [mLab](https://mlab.com) (MongoDB) для базы данных
3. [Heroku](https://www.heroku.com) для деплоя
4. [TravisCI](https://travis-ci.org) для CI
5. [Stylus](http://stylus-lang.com/) для препроцессинга
6. [Mocha](https://mochajs.org/) для тестов
7. [ESLint](http://eslint.org/) для анализа кода 
8. [Mongolab-data-api](https://www.npmjs.com/package/mongolab-data-api) для подключения к базе данных

### Структура проекта
```
blocks/                Блоки статики (Stylus)
controllers/           Логика
generator/             Создание базы данных
lib/                   Локальные модули
tests/                 Тесты
views/                 Шаблоны
app.js                 Стартовое приложение
routes.js              Пути (urls)
webpack.config.js      Production конфиг
webpack.dev.config.js  Dev конфиг
```

### Запуск сервера локально:

```bash
$ npm run dev # сборка статики и запуск
```
### Доступные команды:

```bash
$ npm run test # запуск тестов
$ npm run build # собрать статику с production конфигом
$ npm run start # запуск сервера с dev конфигом
$ npm run lint # запуск линтеров
$ npm run watch # сборка статики на лету
```
### Деплой:
  Автоматическое разворачивание сервера при изменениях в основном репозитории urfu-2015/team3
  
### База данных
  MongoDB: 
  
    mongodb://<dbuser>:<dbpassword>@ds064718.mlab.com:64718/kafkatist

