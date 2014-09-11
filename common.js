$(document).ready(function() {
	(new ViewStart(new ModelData(0))).render($('.content'));
});



//---------------------------------------------------------------------
// Класс для управления данными
function ModelData(minValue, maxValue) {
	this.items = [];
	this.minValue = (typeof minValue === "number" ? minValue : ModelData.MIN_VALUE);
	this.maxValue = (typeof maxValue === "number" ? maxValue : ModelData.MAX_VALUE);
};
// Минимальное значение для генерации
ModelData.MIN_VALUE = -100;
// Максимальное значение для генерации
ModelData.MAX_VALUE = 100;
// Генерация данных для сортировки
//  - length - количество элементов для генерации
ModelData.prototype.generate = function(length) {
	// Обнулить шаги поэтапной сортировки
	this._stepi = 0;
	this._stepj = 0;
	// Обнулить массив элементов
	this.items = [];
	for (var i = 0; i < length; i++) {
		this.items.push(Math.floor(Math.random() * (this.maxValue - 
				this.minValue + 1)) + this.minValue);
	}
};
// Запуск алгоритма сортировки
//  - callback - функция обратного вызова при перестановке элементов
ModelData.prototype.sort = function(onSwap, onComplete) {
	var temp, items = this.items;
	for(var i = 0; i < items.length - 1; i++)
		for(var j = 0; j < items.length - i - 1; j++)
			if(items[j] > items[j + 1]) {
				temp = items[j];
				items[j] = items[j + 1];
				items[j + 1] = temp;
				onSwap(j);
			}
	onComplete();
};
// Запуск пошаговолого выполнения алгоритма сортировки
ModelData.prototype.sortStart = function() {
	this._stepi = 0;
	this._stepj = 0;
};
// Следующий шаг выполнения алгоритма сортировки
ModelData.prototype.sortNext = function() {
	var temp, items = this.items;
	while (this._stepi < items.length - 1) {
		while (this._stepj < items.length - this._stepi - 1) {
			var position = this._stepj++;
			if(items[position] > items[position + 1]) {
				temp = items[position];
				items[position] = items[position + 1];
				items[position + 1] = temp;
				return position;
			}
		}
		this._stepj = 0;
		this._stepi++;
	}
	return -1;
};



//---------------------------------------------------------------------
// Наследование
Function.prototype.extendClass = function(Parent) {
	var F = function() { };
	F.prototype = Parent.prototype;
	this.prototype = new F();
	this.prototype.constructor = this;
	this.superclass = Parent.prototype;
};



//---------------------------------------------------------------------
// Построитель представлений
function HTMLBuilder() {
	this._buffer = [];
	this._index = 0;
};
// Добавление подстроки в буфер
HTMLBuilder.prototype.append = function(text)
{
	this._buffer[this._index] = text;
	this._index++;
	return this;
};
// Строковое представление
HTMLBuilder.prototype.toString = function()
{
	return this._buffer.join('');
};
// Очистить буфер
HTMLBuilder.prototype.clear = function()
{
	this._buffer = [];
};



//---------------------------------------------------------------------
// Базовый класс для представлений
function ViewBase(model) {
	// Строитель HTML-страницы
	this.builder = new HTMLBuilder();
	// Сохранить модель данных для представления
	this.model = model;
};
// Вставка HTML кода в элемент
ViewBase.prototype.insertIn = function($item)
{
	$item.html(this.builder.toString());
	this.builder.clear();
};
// Вставка HTML кода до элемента
ViewBase.prototype.insertBefore = function($item)
{
	$item.before(this.builder.toString());
	this.builder.clear();
};
// Вставка HTML кода после элемента
ViewBase.prototype.insertAfter = function($item)
{
	$item.after(this.builder.toString());
	this.builder.clear();
};



//---------------------------------------------------------------------
// Класс представления стартовой страницы
//  - model - модель данных для отображения
function ViewStart(model) {
	ViewStart.superclass.constructor.call(this, model);
};
// Наследование от построителя представлений
ViewStart.extendClass(ViewBase);
// Отобразить представление
//  - $content - облсать, в которую добавляется HTML
ViewStart.prototype.render = function($content) {
	// Замыкание на модель данных
	var model = this.model;
	
	// Добавить HTML-код
	this.builder.
		append('<div class="banner">').
			append('<p>Руководство:</p>').
			append('<ul>').
				append('<li>Для начала необходимо сгенерировать данные для сортировки. Для этого нажмите кнопку "Генерировать"</li>').
				append('<li>Когда данные будут сгенерированы и появятся на экране нажмите кнопку "Сортировать"</li>').
				append('<li>Начнется визуализированный процесс сортировки.</li>').
				append('<li>Во время сортировки Вы можете управлять скоростью. Для этого воспользуйтей кнопками "+", "-". Максимальная скорость - 10, минимальная - 0</li>').
			append('</ul>').
		append('</div>').
		append('<button>Генерировать</button>');
	this.insertIn($content);
	
	// Навесить обработчики
	$content.find('button').on('click', function() {
		// Генерация данных
		model.generate(10);
		// Отобразить страницу данных
		var view = new ViewData(model);
		view.render($content);
	});
};



//---------------------------------------------------------------------
// Класс представления страницы данных
//  - model - модель данных для отображения
function ViewData(model) {
	ViewData.superclass.constructor.call(this, model);
};
// Наследование от построителя представлений
ViewData.extendClass(ViewBase);
// Отобразить представление
//  - $content - облсать, в которую добавляется HTML
ViewData.prototype.render = function($content) {
	// Плавно поменять местами два элемента
	function slideSwap($itemTop, $itemBottom, onComplete, duration) {
		// Смещение
		var move = $itemBottom.offset().top - $itemTop.offset().top;
		
		// Перемещение
		$itemTop.css('position', 'relative').addClass('bubble-item--top');
		$itemBottom.css('position', 'relative').addClass('bubble-item--bottom');
		$itemTop.animate({ 'top': move }, { duration: duration });
		$itemBottom.animate({ 'top': -move }, {
			duration: duration,
			complete: function() {
				// Поменять элементы местами в DOM
				$itemBottom.after($itemTop);
				$itemTop.css({'position': 'static', 'top': 0}).removeClass('bubble-item--top');
				$itemBottom.css({'position': 'static', 'top': 0}).removeClass('bubble-item--bottom');
				// Вызвать пользовательский обработчик
				if (Object.prototype.toString.call(onComplete) === '[object Function]')
					onComplete();
			}
		});
	};
	
	// Модель данных
	var model = this.model;
	// Скорость всплытия
	var speed = 5;
	
	// Добавить HTML-код
	this.builder.append('<div class="bubbles">');
	for (var i = 0; i < model.items.length; i++)
		this.builder.append('<div class="bubble-item">' + model.items[i] + '</div>');
	this.builder.append('</div>');
	this.builder.append('<button class="sort">Сортировать</button>');
	this.builder.append('<div class="speed">');
		this.builder.append('<button class="speed-down">-</button> ');
		this.builder.append('<span class="speed-title">Скорость:</span> ');
		this.builder.append('<span class="speed-value">' + speed + '</span>');
		this.builder.append(' <button class="speed-up">+</button>');
	this.builder.append('</div>');
	this.insertIn($content);

	// Отобразить элементы
	$content.find('.bubble-item').fadeIn(1000);
	$content.find('button.sort').fadeIn(1000);
	
	// Начало сортировки
	$content.find('button.sort').on('click', function() {
		// Отобразить кнопки управления скоростью
		$content.find('.speed').show();
		// Спрятать кнопку сортировки
		$content.find('button.sort').hide();
		// Начать пошаговую перестановку
		model.sortStart();
		// Сортировка
		(function sort() {
			// Позиция переставляемых элементов
			var position = model.sortNext();
			if (position >= 0) {
				slideSwap($content.find('.bubble-item:eq(' + position + ')'), 
					$content.find('.bubble-item:eq(' + (position + 1) + ')'), sort, (10 - speed) * 100);
			} else {
				if (confirm('Вы хотите повторить?')) {
					// Отобразить стартовую страницу
					(new ViewStart(model)).render($content);
				}
			}
		})();
	});
	// Увеличение скорости
	$content.find('button.speed-up').on('click', function() {
		if (speed < 10)
			$content.find('.speed-value').html(++speed);
	});
	// Уменьшение скорости
	$content.find('button.speed-down').on('click', function() {
		if (speed > 0)
			$content.find('.speed-value').html(--speed);
	});
};