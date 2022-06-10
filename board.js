let mode = '';
let title = '';
let content = '';
let date = '';

//data.json 내용을 로컬스토리지에 문자형식으로 넣는다.
async function dataSet() {
  let check = () => {
    let storageData = JSON.parse(window.localStorage.getItem('storageList'));
    return storageData == null || storageData.length < 0 ? true : false;
  }
  if(check()) {
    const data = await fetch("./data.json")
    .then(response => {
      return response.json();
    });
    window.localStorage.setItem('storageList',JSON.stringify(data));
  }
  boardListAction(); 
}

function modalTitleWrite() {
  let titleType = document.getElementById("titleType");
  if(mode == 'Add') {
    titleType.innerHTML = '등록';
  } else if(mode == 'Edit') {
    titleType.innerHTML = '수정';
  }
}

function modalButtonWrite() {
  let modalButton = document.getElementById("modalButton");
  if(mode == 'Add') {
    modalButton.innerHTML = 'Save';
  } else if(mode == 'Edit') {
    modalButton.innerHTML = 'Eidt';
  }
}

function modalAction() {
  console.log(mode)
  if(mode == 'Add') {
    boardSave();
  } else if (mode =='Edit') {
    boardEdit();
  }
}

function boardSave() {
  let storageData = JSON.parse(window.localStorage.getItem('storageList'));
  let lastIndex = storageData.slice(-1)[0].no;
  let title = document.getElementById('title').value;
  let content = document.getElementById('content').value;
  let date = new Date();
  date = dateFormat(date);

  storageData.push({
    no: lastIndex+1,
    title: title,
    content: content,
    date: date,
  })
  window.localStorage.setItem('storageList',JSON.stringify(storageData));
  boardListAction();
  alert('등록 완료');
  modalClose();
}

function boardListRemove() {
  let dataTable = document.getElementById('dataTable');
  while (dataTable.hasChildNodes() ) {
    dataTable.removeChild( dataTable.firstChild); 
  }
}

//로컬스토리지의 내용을 읽어서 테이블에 데이터를 바인딩시킨다. 
function boardListAction() {
  let storageList = JSON.parse(window.localStorage.getItem('storageList'));
  const dataTable = document.getElementById('dataTable');
  boardListRemove();
  if(storageList) {
    storageList.forEach(data => {
      let tr = document.createElement("tr");
      let th_no = document.createElement("th");
      let td_title = document.createElement("td");
      let td_content = document.createElement("td");
      let td_date = document.createElement("td");
      let td_action = document.createElement("td");

      th_no.setAttribute('scope', 'row');

      th_no.innerText = data.no;
      td_title.innerText = data.title;
      td_content.innerText = data.content.length > 20 ? data.content.substr(0, 20) + '...' : data.content; //20글자 뒤에는 ... 으로 처리
      td_date.innerText = data.date;
      td_action.innerHTML = `
        <i class="bi bi-file-text" onClick="detailItem(`+data.no+`)"></i>
        <i class="bi bi-trash-fill" onClick="deleteItem(`+data.no+`)"></i>
      `;

      tr.appendChild(th_no);
      tr.appendChild(td_title);
      tr.appendChild(td_content);
      tr.appendChild(td_date);
      tr.appendChild(td_action);

      dataTable.appendChild(tr)

    });
  }
}

function modalOpen(type) {
  document.getElementsByClassName("modal-backdrop")[0].style.display = "block";
  document.getElementsByClassName("modal")[0].style.display = "block";
  mode = type;
  modalTitleWrite();
  modalButtonWrite();
}

function modalClose() {
  document.getElementsByClassName("modal-backdrop")[0].style.display = "none";
  document.getElementsByClassName("modal")[0].style.display = "none";
  mode = '';
}

function detailItem(no) {
  console.log(no)
}

function deleteItem(no){
  if (confirm(no +'번 글을 삭제하시겠습니까?') === true) {
    let storageList = JSON.parse(window.localStorage.getItem('storageList'));
    storageList = storageList.filter(function(data) {
      return data.no != no;
    });
    window.localStorage.setItem('storageList',JSON.stringify(storageList));
    boardListAction();
  } else {
    return false;
  }
}

dataSet();

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}
includeHTML();

function dateFormat(dateNum) {
  const date = new Date(dateNum);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hour = ('0' + date.getHours()).slice(-2);
  const min = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  let result = '';
  if (dateNum !== 0) {
    result = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + seconds;
  }
  return result;
}