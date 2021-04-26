const BASE_URL = "https://strangers-things.herokuapp.com/api/2102-CPU-RM-WEB-PT";

//Fetching
const fetchPosts = async () => {
	try {
		const response = await fetch(`${BASE_URL}/posts`);
		const { data } = await response.json();
    console.log(data, 'this is fetchPosts function')
		return data;
	} catch (err) {
		console.error(err);
	}
};

const testPosts = fetchPosts()
const testPosts2 = testPosts.posts
console.log(testPosts, 'this is testpost #1 ')
console.log(testPosts2, 'this is testposts')

const fetchSelf = async () => {
  const token = fetchToken();
     try {
       const response = await fetch(`${BASE_URL}/users/me`, {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       });
       const result = await response.json();
       return result;
     } catch (error) {
       console.log(error)
     }
};

const fetchToken = () => {
  const token = JSON.parse(localStorage.getItem("token"));
  return token ? token : ''
};

//Rendering Posts
const renderPosts = async () => {
	const posts = await fetchPosts();
  const finalPosts = posts.posts
  console.log(posts, 'from inside renderposts')
  console.log(finalPosts, 'this is a test run')
    $(".col-md-8").empty();
    finalPosts.forEach((post) => {
      const postElement = createPostHtml(post);
      $(".col-md-8").prepend(postElement);
      
    })
	console.log(posts, 'new renderPosts'); // Posts that have been saved to the database
};

//Fetch & Render
const fetchAndRender = async () => {
  const posts = await fetchPosts();
  const userData = await fetchSelf();
  renderPosts(userData, posts.data.posts);
};

//Post display
  function createPostHtml(post) {
    const {
      title,
      description,
      price,
      location,
      willDeliver,
      author: { username, _id },
    } = post;

    return $(`
    <div class="card mb-4">
    <div class="card-body">
      <h2 class="card-title">${title}</h2>
      <p class="card-text">${description}</p>
      <p class="card-price"><a class="user-price">${price}</a></p>
    </div>
    <div class="card-footer text-muted">
      Posted by
      <a class="posted-by" href="#">${username}</a>
      </br>
      <button class="edit-delete" type="button">Delete Post</button>
      <button class="send-message" data-bs-toggle="modal" data-bs-target="#messageModal" type="button">Send Message</button>
      
    </div>
  </div>`).data("post", post);
  }

//Register an account
  const registerUser = async (usernameValue, passwordValue) => {
    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        body: JSON.stringify({
          user: {
            username: usernameValue,
            password: passwordValue,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data: { token }, } = await response.json();
      console.log(token)
      localStorage.setItem("token", JSON.stringify(token));
      showLoginForm();
      alert('You have successfully registered an account. Please sign in.');
    } catch (error) {
      shakeModal2()
      console.log(error);
      throw error;
    }
  };

//Login to existing account
  const loginUser = async (usernameValue, passwordValue) => {
    const url = `${BASE_URL}/users/login`
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          user: {
            username: usernameValue,
            password: passwordValue,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data: { token } } = await response.json();
      localStorage.setItem("token", JSON.stringify(token));
      fetchSelf();
      hideLogin();
      showCreatePost();
      alert('You are logged in to your account.')
    } catch (error) {
      shakeModal()
      throw error;
    }
  };

  $("#register-form").on("submit", async (event) => {
    event.preventDefault()
    const username = $("#registerusername").val(); // get username input
    const password = $("#registerpassword").val(); // get password input
    registerUser(username, password)
    });
    
    $("#login-form").on("submit", async (event) => {
    event.preventDefault()
    const token = fetchToken()
    const username = $("#loginusername").val(); // get username input
    const password = $("#loginpassword").val(); // get password input
    loginUser(username, password)
    });

//Hide Login and Registration for persistent login
  const hideRegistration = () => {
    const token = fetchToken();
      if (token){
        $('#loginModal').css('display', 'none', 'important');
        $('.modal-backdrop').css('display', 'none', 'important')
    }else{
        console.log('Nothing to hide')
        fetchAndRender()
    }};
    
  const hideLogin = () => {
    const token = fetchToken();
      if (token){
        $('#loginModal').css('display', 'none', 'important');
        $('.modal-backdrop').css('display', 'none', 'important')
        $('#log-out').css('visibility', 'visible');
        $('.big-login').css('visibility', 'hidden');
        showButtons();
        showCreatePost();
    }else{
        console.log('Nothing to hide')
        fetchAndRender();
  }};

//Search Bar 

const searchPosts = (post, searchInput) =>{
  return post.title.toLowerCase().includes(searchInput.toLowerCase()) || post.description.toLowerCase().includes(searchInput.toLowerCase())
};

$("#seatch-button").on('click', async()=>{
  
  let input = $("#search-bar input").val().trim()
  const {data:{posts}} = await fetchPosts()
  const filteredPosts = posts.filter(post => searchPosts(post, input))
  const myData = await fetchSelf();

  renderPosts(myData, filteredPosts);
  $('#search-bar').trigger('reset')
});

//Send A Message
const sendMessage = async (messages, postId) => {
  const {
    post: { _id },
  } = postId;

  const token = JSON.parse(localStorage.getItem("token"));

  try {
    const response = await fetch(`${BASE_URL}/posts/${_id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messages),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
  }
};

const renderMessage = (postMessage, username) => {
  const cardElement = $(`
      <div class="card-body">
        <div class="card-title">Message</div>
          <div class="card-text">
              <p class="card-text">${postMessage}</p>
              <div class="card-footer text-muted">
              From
              <a class="posted-by" href="#">${username}</a>
              </div>
          </div>
      </div>`).append($('.col-md-8'))
  return cardElement
}

$('#messageModal form').on('submit', async function(event) {
  event.preventDefault()
  const messageData = {
      message: {
        content: $("#messageTextArea").val(),
      },
  }
  try {
      const result = await sendMessage(messageData)
      console.log(result)
      
      // renderMessage()
      $('.modal').removeClass('open')
      $('#messageModal form').trigger('reset')
      
  } catch (error) {
      console.log(error)
  }
  console.log(messageData)
  
})

//Hide Post Form
function hideCreatePost(){
    $('#create-post').css('visibility', 'hidden');
    $('#log-out').css('visibility', 'hidden');
    $('.big-login').css('visibility', 'visible');
    $('.edit-delete').css('visibility', 'hidden');
    $('.send-message').css('visibility', 'hidden')
};

function showCreatePost(){
    $('#create-post').css('visibility', 'visible');
    $('#log-out').css('visibility', 'visible');
    $('.big-login').css('visibility', 'hidden');
    
};

//Create A Post
 const postBlogEntry = async (requestBody) => {
     const token = fetchToken();
	try {
		const request = await fetch(`${BASE_URL}/posts`, {
			method: "POST", 
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify(requestBody),
		});
    alert('Your listing has been posted! Please refresh the feed.')
        return request
	} catch(error) {
		console.error(error)
	}
};

$(".create-a-post").on("submit", (event) => {
	event.preventDefault();

	const blogTitle = $('#blog-title').val();
	const blogDescription = $('#blog-description').val();
	const blogAuthor = $('#blog-author').val();
    const blogPrice = $('#blog-price').val()

	const requestBody = {
		post: {
			title: blogTitle,
			description: blogDescription,
            price: blogPrice,
			author: blogAuthor
		}
	};

	postBlogEntry(requestBody)
	$(".create-a-post").trigger('reset')
  $('.card-mb-4').load(document.URL +  '.card-mb-4')
});

//Delete only your own posts
const deletePost = async (postId) => {
  const token = JSON.parse(localStorage.getItem("token"));
  const my = fetchSelf();

  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    console.log(result)
    if(token){
      ''
    }else{
      alert('JK! It was not deleted... You are not logged in!')
    }
  } catch (error) {
    console.error('error error error');
  }
};

$(".col-md-8").on("click", ".edit-delete", async (event) => {
  event.preventDefault();

  const cardElement = $(event.target).closest(".card.mb-4");
  console.log(cardElement);
  const data = cardElement.data();
  console.log(data);
  const {
    post: { _id },
  } = data;
  console.log(_id);

  deletePost(_id);
  alert('Your post has been removed. Please refresh the feed.')
});

//Click functions
$('.navbar-toggler-icon').click(function(){
  openLoginModal();
});

$('#log-out').click(function(){
  localStorage.removeItem('token')
  alert('You have been logged out.')
  window.location.reload()
});

$('#new-spot').click(function(){
  location.reload()
});

//Show Delete and Send Message buttons while logged in
function showButtons(){
  $('.edit-delete').css('visibility', 'visible', 'important');
  $('.edit-delete').text('Delete Post');
  $('.send-message').css('visibility', 'visible', 'important')
  $('.send-message').text('Send Message', 'important')
};

//Modal for login and register
/* 
 *
 * login-register modal
 * Author: Creative Tim
 * Web-author: creative.tim
 * Web script: http://creative-tim.com
 * 
 */
function showRegisterForm(){
    $('.loginBox').fadeOut('fast',function(){
        $('.registerBox').fadeIn('fast');
        $('.login-footer').fadeOut('fast',function(){
            $('.register-footer').fadeIn('fast');
        });
        $('.modal-title').html('Register').css('font-family', 'Unica One');
    }); 
    $('.error').removeClass('alert alert-danger').html('');
       
}
function showLoginForm(){
    $('#loginModal .registerBox').fadeOut('fast',function(){
        $('.loginBox').fadeIn('fast');
        $('.register-footer').fadeOut('fast',function(){
            $('.login-footer').fadeIn('fast');    
        });
        
        $('.modal-title').html('Login').css('font-family', 'Unica One');
    });       
     $('.error').removeClass('alert alert-danger').html(''); 
}

function openMessageModal(){
  setTimeout(function(){
  $('#messageModal').modal('show')
})}


function openLoginModal(){
    showLoginForm();
    setTimeout(function(){
        $('#loginModal').modal('show');    
    }, 230);
    
}
function openRegisterModal(){
    showRegisterForm();
    setTimeout(function(){
        $('#loginModal').modal('show');    
    }, 230);
    
}

function loginAjax(){
    /*   Remove this comments when moving to server
    $.post( "/login", function( data ) {
            if(data == 1){
                window.location.replace("/home");            
            } else {
                 shakeModal(); 
            }
        });
    */

/*   Simulate error message from the server   */
     shakeModal();
}

function shakeModal(){
    $('#loginModal .modal-dialog').addClass('shake');
             $('.error').addClass('alert alert-danger').html("Invalid username and/or password. Please Try Again.");
             $('input[type="password"]').val('');
             setTimeout( function(){ 
                $('#loginModal .modal-dialog').removeClass('shake'); 
    }, 1000 ); 
}

function shakeModal2(){
  $('#loginModal .modal-dialog').addClass('shake');
           $('.error').addClass('alert alert-danger').html("This username is already taken. Please Try Again.");
           $('input[type="password"]').val('');
           setTimeout( function(){ 
              $('#loginModal .modal-dialog').removeClass('shake'); 
  }, 1000 ); 
}

//Persist login
(async () => {
  hideRegistration();
  hideLogin();
  showButtons()
})();

renderPosts()