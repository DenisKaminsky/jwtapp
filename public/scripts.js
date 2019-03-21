//Get all books
function GetBooks() {
    $.ajax({
        url: "/api/books",
        type: "GET",
        contentType: "application/json",
        success: function (books) {
            var rows = "";
            $.each(books, function (index, book) {
                // добавляем полученные элементы в таблицу
                rows += row(book);
            })
            $("table tbody").append(rows);
         }
    });
}

//get book by id
function GetBook(id) {
    $.ajax({
        url: "/api/books/"+id,
        type: "GET",
        contentType: "application/json",
        success: function (book) {
            var form = document.forms["userForm"];
            form.elements["id"].value = book.id;
            form.elements["title"].value = book.title;
            form.elements["author"].value = book.author;
            form.elements["release"].value = book.release;
        }
    });
}

//create new book
function CreateBook(bookTitle, bookAuthor,releaseDate) {
    $.ajax({
        url: "api/books",
        contentType: "application/json",
        method: "POST",
        data: JSON.stringify({
            title: bookTitle,
            author: bookAuthor,
            release: releaseDate
        }),
        success: function (book) {
            reset();
            $("table tbody").append(row(book));
        },
        error: function (err) {
            OpenSignInForm();
        }
    })
}

//modify book
function EditBook(bookId,bookTitle, bookAuthor,releaseDate) {
    $.ajax({
        url: "api/books",
        contentType: "application/json",
        method: "PUT",
        data: JSON.stringify({
            id: bookId,
            title:bookTitle,
            author: bookAuthor,
            release: releaseDate
        }),
        success: function (book) {
            reset();
            $("tr[data-rowid='" + book.id + "']").replaceWith(row(book));
        },
        error: function (err) {
            OpenSignInForm();
        }
    })
}

//form fields reset
function reset() {
    var form = document.forms["userForm"];
    form.reset();
    form.elements["id"].value = 0;
}

//Delete book by id
function DeleteBook(id) {
    $.ajax({
        url: "api/books/"+id,
        contentType: "application/json",
        method: "DELETE",
        success: function (book) {
            console.log(book);
            $("tr[data-rowid='" + book.id + "']").remove();
        },
        error: function (err) {
            OpenSignInForm();
        }
    })
}

function ClearSignInForm(){
    var authForm = document.forms["authForm"];
    authForm.reset();
    var regForm = document.forms["regForm"];
    regForm.reset();
}

function OpenSignInForm(){
    ClearSignInForm();
    $("#signInModal").modal("show");
}

function LogIn(uLogin,uPassword){
    $.ajax({
        url: "api/authorize",
        contentType: "application/json",
        method: "POST",
        data: JSON.stringify({
            login: uLogin,
            password: uPassword
        }),
        success: function (user) {
            
            //...
            $("#signInModal").modal("hide");
        },
        error: function (request, status, error) {
            if (request.status == 404)
                alert("Wrong login");
            else if (request.status == 401)
                alert("Wrong password");
        }
    })
}

function Register(uName,uLogin,uPassword){
    $.ajax({
        url: "api/register",
        contentType: "application/json",
        method: "POST",
        data: JSON.stringify({
            name: uName,
            login: uLogin,
            password: uPassword
        }),
        success: function (user) {

            //...
            $("#signInModal").modal("hide");
        },
        error: function (err) {
            alert("User already exist!");
        }
    })
}


//create table row
var row = function (book) {
    return "<tr data-rowid='"+book.id + "'>"+
               "<td>" + book.id + "</td>" +
               "<td>" + book.title + "</td>"+
               "<td>" + book.author + "</td>"+
               "<td>" + book.release + "</td>"+
               "<td>"+
                   "<button class=' btn btn-primary mb-2 pull-right editLink ' data-id='" + book.id + "'>Modify</button>" +
                   "<button class=' btn btn-danger mb-2 pull-right removeLink' data-id='" + book.id + "'>Delete</button>"+
               "</td>"+
            "</tr>";
}

//reset form values
$("#reset").click(function (e) {
    e.preventDefault();
    reset();
})

//Modify button click
$("body").on("click", ".editLink", function () {
    var id = $(this).data("id");
    GetBook(id);
})

//Delete button click
$("body").on("click", ".removeLink", function () {
    var id = $(this).data("id");
    DeleteBook(id);
})

//LogIn click
$("body").on("click","#logInBtn", function(){
    OpenSignInForm();
})

//book form processing
$("#userForm").submit(function (e) {
    e.preventDefault();
    var id = this.elements["id"].value;
    var title = this.elements["title"].value;
    var author = this.elements["author"].value;
    var releaseDate = this.elements["release"].value;

    if (id == 0)
        CreateBook(title,author,releaseDate);
    else
        EditBook(id,title,author,releaseDate);
})

//authorization form processing
$("#authForm").submit(function (e) {
    e.preventDefault();
    var login = this.elements["login"].value;
    var password = this.elements["password"].value;

    LogIn(login,password);
})

//registration form processing
$("#regForm").submit(function (e) {
    e.preventDefault();
    var name = this.elements["name"].value;
    var login = this.elements["login"].value;
    var password = this.elements["password"].value;

    Register(name,login,password);
})

//load books
GetBooks();