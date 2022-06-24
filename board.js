let _boardNo = '';
let _page = 0;
let _start = 0;
let _limit = 10;
let _storageData = null;

//data.json 내용을 로컬스토리지에 문자형식으로 넣는다.
async function dataSet() {
  let check = () => {
    _storageData = JSON.parse(window.localStorage.getItem('storageList'));
    return _storageData == null || _storageData.length < 0 ? true : false;
  }
  if(check()) {
    const data = await fetch("./data.json")
    .then(response => {
      return response.json();
    });
    window.localStorage.setItem('storageList',JSON.stringify(data));
  }
  boardListAction();
  renderPagination(_storageData, _page+1);
}

function modalModeSet() {
  let titleType = document.getElementById("titleType");
  let modalButton = document.getElementById("modalButton");
  if(mode == 'Add') {
    titleType.innerHTML = '글 등록';
    modalButton.innerHTML = '등록';
  } else if(mode == 'Detail') {
    titleType.innerHTML = '글 상세';
    modalButton.innerHTML = '수정모드';
  } else if(mode == 'Edit') {
    titleType.innerHTML = '글 수정';
    modalButton.innerHTML = '수정';
  }
}

function modalAction() {
  if(mode == 'Add') {
    boardSave();
  } else if(mode == 'Detail') {
    document.getElementById('title').readOnly = false;
    document.getElementById('content').readOnly = false;
    mode = 'Edit';
    modalModeSet();
  } else if(mode == 'Edit') {
    boardEdit();
  }
}

function boardSave() {
  //let storageData = JSON.parse(window.localStorage.getItem('storageList'));
  let lastIndex = _storageData.length == 0 ? 0 : _storageData.slice(-1)[0].no;
  let title = document.getElementById('title').value;
  let content = document.getElementById('content').value;
  let date = new Date();
  date = dateFormat(date);

  _storageData.push({
    no: lastIndex+1,
    title: title,
    content: content,
    date: date,
  })
  window.localStorage.setItem('storageList',JSON.stringify(_storageData));
  boardListAction();
  alert('등록 완료');
  modalClose();
}

function boardEdit() {
  let title = document.getElementById('title').value;
  let content = document.getElementById('content').value;
  let storageList = JSON.parse(window.localStorage.getItem('storageList'));
  let date = new Date();

  date = dateFormat(date);
  const index = storageList.findIndex((data) => {
    return data.no == _boardNo;
  });

  storageList[index] = new Object({
    no: _boardNo,
    title: title,
    content: content,
    date: date,
  });

  window.localStorage.setItem('storageList',JSON.stringify(storageList));
  boardListAction();
  modalClose();
  alert('수정 완료');
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

    for(let i=_start; i<_limit; i++) {
      if(storageList[i]) {
        let tr = document.createElement("tr");
        let th_no = document.createElement("th");
        let td_title = document.createElement("td");
        let td_content = document.createElement("td");
        let td_date = document.createElement("td");
        let td_action = document.createElement("td");

        th_no.setAttribute('scope', 'row');
        th_no.innerText = storageList[i].no;
        td_title.innerText = storageList[i].title;
        td_content.innerText = storageList[i].content.length > 20 ? storageList[i].content.substr(0, 20) + '...' : storageList[i].content; //20글자 뒤에는 ... 으로 처리
        td_date.innerText = storageList[i].date;
        td_action.innerHTML = `
          <i class="bi bi-file-text" onClick="detailItem(`+storageList[i].no+`)"></i>
          <i class="bi bi-trash-fill" onClick="deleteItem(`+storageList[i].no+`)"></i>
        `;

        tr.appendChild(th_no);
        tr.appendChild(td_title);
        tr.appendChild(td_content);
        tr.appendChild(td_date);
        tr.appendChild(td_action);

        dataTable.appendChild(tr);
      }
    }
  }
}

function renderPagination(totalCount, currentPage) {
  if (totalCount.length <= 10) return; 
  
  var totalPage = Math.ceil(totalCount.length / 10);
  var pageGroup = Math.ceil(currentPage / 10);

  var last = pageGroup * 10;
  if (last > totalPage) last = totalPage;
  var first = last - (10 - 1) <= 0 ? 1 : last - (10 - 1);
  var next = last + 1;
  var prev = first - 1;

  let pageList = document.createElement('ul');
  pageList.id = 'page_ul';
  pageList.className = 'pagination';

  if (prev > 0) {
    const preli = document.createElement('li');
    preli.className = 'page-item';
    preli.onclick = () => prePage(first);
    preli.insertAdjacentHTML("beforeend", `<span class="page-link">Previous</span>`);
    //preli.insertAdjacentHTML("beforeend", `<li class="page-item" onClick="prePage(${first})"><span class="page-link">Previous</span></li>`);
    pageList.appendChild(preli);
  }
	
  for (let i = first; i <= last; i++) {
    const li = document.createElement("li");
    li.className = 'page-item-' + i;
    li.onclick = () => movePage(i);
    li.insertAdjacentHTML("beforeend", `<a class="page-link" href="#">${i}</a>`);
    pageList.appendChild(li);
  }

  if (last < totalPage) {
    const endli = document.createElement('li');
    endli.className = 'page-item';
    endli.onclick = () => nextPage(last);
    endli.insertAdjacentHTML("beforeend", `<a class="page-link" href="#">Next</a>`);

    pageList.appendChild(endli);
  }

  document.getElementById('js-pagination').appendChild(pageList);

  let pageItem = document.getElementsByClassName(`page-item-${currentPage}`);
  pageItem[0].classList.add("active");
};

function movePage(page) {
  _page = page;
  _start = Number(String(page) + '0') - 10;
  _limit = Number(String(page) + '0');

  let activeItem = document.getElementsByClassName('active');
  activeItem[0].classList.remove('active')
  let pageItem = document.getElementsByClassName(`page-item-${page}`);
  pageItem[0].classList.add("active");

  boardListAction();
}

function nextPage(last) {
  let page_ul = document.getElementById('page_ul');
  while (page_ul.hasChildNodes() ) {
    page_ul.removeChild(page_ul.firstChild); 
  }
  page_ul.remove();

  renderPagination(_storageData, last+1);
  movePage(last+1)
}

function prePage(first) {
  let page_ul = document.getElementById('page_ul');
  while (page_ul.hasChildNodes() ) {
    page_ul.removeChild(page_ul.firstChild); 
  }
  page_ul.remove();

  renderPagination(_storageData, first-10);
  movePage(first-10)
}

function modalOpen(type) {
  document.getElementsByClassName("modal-backdrop")[0].style.display = "block";
  document.getElementsByClassName("modal")[0].style.display = "block";
  mode = type;
  modalModeSet();
}

function modalClose() {
  document.getElementsByClassName("modal-backdrop")[0].style.display = "none";
  document.getElementsByClassName("modal")[0].style.display = "none";
  mode = '';
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
}

function detailItem(no) {
  modalOpen('Detail');
  let storageList = JSON.parse(window.localStorage.getItem('storageList'));
  let detail = storageList.filter((data) => {
    return data.no == no;
  });
  let title = document.getElementById('title');
  let content = document.getElementById('content');
  title.value = detail[0].title;
  content.value = detail[0].content;
  title.readOnly = true;
  content.readOnly = true;
  _boardNo = no;
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