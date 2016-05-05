var HIDDEN_CLASS = "hidden";
var owners = ["Joe", "Seb", "Ken"];
var walkers = ['Danny "Dog" Doe', 'Ronny "Run" Rooney', 'Freddy "Food" Frederick'];
var requests = [
  { owner: 0, walker: 3, date: '1/1/1901 - 2pm' },
  { owner: 1, walker: 2, date: '11/11/1911 - 3am' },
  { owner: 2, walker: 1, date: '5/16/2016 - 5pm' },
];
var sections = ["signup", "owner-request", "walker-requests"];

$(document).ready(function() {
  updateWalkerSelection();
  updateUserSelection();
  showSectionOnly("signup");

  $('#home').click($.proxy(showSectionOnly, null, "signup"));

  $('#signup-button').click(function() {
    var name = $('#name').val().trim();
    var isOwner = $('#owner').is(':checked');
    var isWalker = $('#walker').is(':checked');

    if (name.length == 0 || !isOwner && !isWalker) {
      alert("Bad or missing input");
    } else {
      resetSignup();

      var pushInto = isOwner ? owners : walkers;
      pushInto.push(name);

      updateWalkerSelection();
      updateUserSelection();
      showSectionForUser(isOwner, pushInto.length - 1);
    }
  });

  $('#user-selection').change(function() {
    var user = $('#user-selection').val();
    if (user.length != 0) {
      var isOwner = user.startsWith('o');
      var id = parseInt(user.substr(1));
      resetSignup();
      showSectionForUser(isOwner, id);
    }
  });

});

function resetSignup() {
  // Reset form elements.
  $('#name').val('');
  $('#owner').removeAttr('checked');
  $('#walker').removeAttr('checked');
  $('#user-selection').val('');
}

function showSectionForUser(isOwner, userId) {
  if (isOwner) {
    updateRequestForm(userId);
  } else {
    updateRequests(userId);
  }
  var nextSection = isOwner ? "owner-request" : "walker-requests";
  showSectionOnly(nextSection);
}

function showSectionOnly(section) {
  for (var i = 0; i < sections.length; i++) {
    var tag = $('#' + sections[i]);
    if (section == sections[i]) {
      tag.removeClass(HIDDEN_CLASS);
    } else {
      tag.addClass(HIDDEN_CLASS);
    }
  }
}

function updateUserSelection() {
  $('#user-selection').empty(); // Clear all options first.

  $('#user-selection').append(
      "<option value=''>Please select</option>");
  for (var i = 0; i < walkers.length; i++) {
    $('#user-selection').append(
        "<option value='w" + i + "'>" + walkers[i] + " (Dog walker) </option>");
  }
  for (var i = 0; i < owners.length; i++) {
    $('#user-selection').append(
        "<option value='o" + i + "'>" + owners[i] + " (Dog owner)</option>");
  }
}

function updateWalkerSelection() {
  $('#walker-selection').empty(); // Clear all options first.

  for (var i = 0; i < walkers.length; i++) {
    $('#walker-selection').append(
        "<option value='" + i + "'>" + walkers[i] + "</option>");
  }
}

function updateRequestForm(currentUserId) {
  $('#request-confirmation').addClass(HIDDEN_CLASS);
  $('#request').off("click");  // unbind previous event handler
  $('#request').click(function() {
    var date = $('#date').val().trim();
    var walker = $('#walker-selection').val();
    if (date.length == 0) {
      alert("Bad or missing input");
    } else {
      // Reset form elements.
      $('#date').val('');
      $('#walker-selection').val(0);

      requests.push({ owner: currentUserId, walker: walker, date: date });
      $('#request-confirmation').removeClass(HIDDEN_CLASS);
    }
  });
}

function updateRequests(currentUserId) {
  $('#requests').empty(); // Clear the table first, then add the header.
  $('#requests').append("<tr><th>Dog owner</th><th>Date</th><th>Accept?</th></tr>");

  for (var i = 0; i < requests.length; i++) {
    var request = requests[i];
    if (request.walker != currentUserId) {
      continue;
    }
    var name = $('<td>').text(owners[request.owner]);
    var date = $('<td>').text(request.date);
    var accept = $('<button>').addClass('btn btn-primary').text('Accept');
    var reject = $('<button>').addClass('btn btn-primary').text('Reject');
    var row = $('<tr>').append(name, date, $('<td>').append(accept, reject));

    accept.click(function() {
      var row = $(this).closest('tr');
      requests.splice(row[0].rowIndex - 1, 1);
      row.remove();
    });

    reject.click(function() {
      var row = $(this).closest('tr');
      requests.splice(row[0].rowIndex - 1, 1);
      row.remove();
    });

    $('#requests').append(row);
  }
}
