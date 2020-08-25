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


