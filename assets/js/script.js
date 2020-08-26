var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function (taskEl) {
  // get date from task element
  var date = $(taskEl).find('span').text().trim();
  
  // convert to moment object at 5:00pm
  var time = moment(date, "L").set('hour', 17);

  // remove any old classes from element
  $(taskEl).removeClass('list-group-item-warning list-group-item-danger');

  // apply new class if task is near/over due date
  // if this moment in time is after the `time`, apply a red background, i.e. `list-group-item-danger`.
  if (moment().isAfter(time)) {
    $(taskEl).addClass('list-group-item-danger');
  } 
  // if this moment in time is less than two days away, apply a yellow background, i.e. `list-group-item-warning`
  // Math.abs() is wrapping this to swap the result from being -2 days away to 2 days away. (think t-minus seconds to countdown)
  else if (Math.abs(moment().diff(time, 'days')) <= 2) {
    $(taskEl).addClass('list-group-item-warning');
  }
  
}

// for any <p> elements clicked within a parent element with a class of `list-group`, perform this function...
$('.list-group').on('click', "p", function() {
  // `text` selects the event target, pulls it's inner text, and trims any whitespace.
  var text = $(this)
  .text()
  .trim();

  // `textInput` creates a <textarea> w/ `form-control` as a class and a value equal to what `text` returns.
  var textInput = $('<textarea>')
  .addClass('form-control')
  .val(text);

  // replace the selected `p` element with the <textarea> created by `textInput`
  $(this).replaceWith(textInput);

  // when `textInput` is triggered, make it the focus of the page, i.e. highlight it.
  textInput.trigger('focus');
});

// for any <textarea> elements that lose focus(blur) within a parent element with a class of `list-group`, perform this function...
$('.list-group').on('blur', 'textarea', function() {
  // get the <textarea>'s current value/text and cut out any unused whitespace
  var text = $(this)
  .val()
  .trim();

  // get the parent <ul>'s id attribute
  var status = $(this)
  .closest('.list-group')
  // gets an attribute since there is only one argument
  .attr('id')
  // replace `list-` with `''`
  .replace('list-', '');

  // get the task's position in the list of other <li> elements
  var index = $(this)
  .closest('.list-group-item')
  .index();

  // in the `tasks` object, find the [status] array at the provided [index], and make it's text equal to `var text`
  tasks[status][index].text = text;
  saveTasks();

  // recreate a <p> element
  var taskP = $('<p>')
  .addClass('m-1')
  .text(text);

  // replace <textarea> with this <p> element
  $(this).replaceWith(taskP);
});

// for any <input> elements that change w/ a `type='text'`, within a parent `class='list-group'`, perform this function...
$('.list-group').on('click', 'span', function() {
  // get current text
  var date = $(this)
  .text()
  .trim();

  // create new input element
  var dateInput = $('<input>')
  // sets a new attribute since there are two arguments
  .attr('type', 'text')
  .addClass('form-control')
  .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // when the due date is edited...
  dateInput.datepicker({
    // pull up a calendar with tomorrow as the earliest possible selection
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a 'change' event on the `dateInput`/`this`
      $(this).trigger('change');
    }
  });

  // automatically focus on new element
  dateInput.trigger('focus');
});

// for any <input> elements, with a type of `text`, that change within a parent element with a class of `list-group`, perform this function...
$('.list-group').on('change', 'input[type="text"]', function() {
  // get current text
  var date = $(this)
  .val()
  .trim();

  // get the parent <ul>'s id attribute
  var status = $(this)
  .closest('.list-group')
  .attr('id')
  .replace('list-', '');

  // get the task's position in the list of other <li> elements
  var index = $(this)
  .closest('.list-group-item')
  .index();

  // update task in array and re-save to `localStorage`
  tasks[status][index].date = date;
  saveTasks();

  // recreate <span> element with bootstrap classes
  var taskSpan = $('<span>')
  .addClass('badge badge-primary badge-pill')
  .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest('.list-group-item'));
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// modal's due date field is selected, show calendar
$('#modalDueDate').datepicker({
  // the first available date to select is today + 1...or tomorrow
  minDate: 1,
});

// every element with a `list-group` class, nested within a `card` class, is a sortable list.
$('.card .list-group').sortable({
  // elements with a `list-group` class, nested within a `card` class, are connected as 'sortable'.
  connectWith: $('.card .list-group'),
  // prevents the dragged element from scrolling the page
  scroll: false,
  // sets the where the test is held to determine if the moved item is hovering over a valid item. 
  // here it is saying to look for wherever the cursor is
  tolerance: 'pointer',
  // creates a copy of the dragged element that moves instead of the original element selected.
  helper: 'clone',

  update: function(event) {
    // empty array to store task data in
    var taskListArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      // find the <p> elements of the children being looped over and trim their text
      var text = $(this)
      .find('p')
      .text()
      .trim();

      // find the <span> elements of the children being looped over and trim their text.
      var date = $(this)
      .find('span')
      .text()
      .trim();

      // push the found texts and dates of any <li>s into an array, as an object. 
      taskListArr.push({
        text: text, 
        date: date
      });
    });

    // trim down the list's ID to match it's `tasks` object property
    var arrName = $(this)
    .attr('id')
    .replace('list-', '');

    // update array on `tasks` object and save to localStorage
    tasks[arrName] = taskListArr;
    saveTasks();
  },
});

// designates any element with an id of `trash` is a droppable element.
$('#trash').droppable({
  // the droppable element accepts any `list-group-item` coming from a `card`
  accept: '.card .list-group-item',
  // as soon as the draggable element itself touches the droppable element, it is able to be dropped.
  tolerance: 'touch',
  // on element drop, perform the `remove()` method on the draggable element. 
  drop: function(event, ui) {
    ui.draggable.remove();
  },
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


