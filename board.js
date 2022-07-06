let _storageData = null;
let _page = 1; //현재 페이지 번호
let _start = 0; //조회 시작 데이터 배열 번호
let _limit = 10; //조회 마지막 데이터 배열 번호
let _mode = '';

//data.json 내용을 로컬스토리지에 문자형식으로 넣는다.
async function dataSet() {
  let check = () => {
    _storageData = JSON.parse(window.localStorage.getItem('storageList'));
    return _storageData == null || _storageData.length < 0 ? true : false;
  }
  if(check()) { //로컬스토리지 storageList 내용이 없을때만 .jon 데이터를 읽어들여 로컬스토리지에 넣는다.
    const data = await fetch("./data.json")
    .then(response => {
      return response.json();
    });
    window.localStorage.setItem('storageList',JSON.stringify(data));
  }
  boardListAction(); //게시물 목록 바인딩
  renderPagination(_storageData, _page); //페이징 바인딩
}

function modalModeSet() {
  let titleType = document.getElementById("titleType");
  let modalButton = document.getElementById("modalButton");
  if(_mode == 'Add') {
    titleType.innerHTML = '글 등록';
    modalButton.innerHTML = '등록';
  } else if(_mode == 'Detail') {
    titleType.innerHTML = '글 상세';
    modalButton.innerHTML = '수정모드';
  } else if(_mode == 'Edit') {
    titleType.innerHTML = '글 수정';
    modalButton.innerHTML = '수정';
  }
}

function modalAction() {
  if(_mode == 'Add') {
    boardSave();
  } else if (_mode =='Edit') {
    boardEdit();
  }
}

function boardSave() {
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

function detailItem(no) {
  console.log(no)
}

function deleteItem(no){
  if (confirm(no +'번 글을 삭제하시겠습니까?') === true) {
    _storageData = _storageData.filter(function(data) {
      return data.no != no;
    });
    window.localStorage.setItem('storageList',JSON.stringify(_storageData));
    boardListAction();
  } else {
    return false;
  }
}

//로컬스토리지의 내용을 읽어서 테이블에 데이터를 바인딩시킨다. 
function boardListAction() {
  const dataTable = document.getElementById('dataTable');
  boardListRemove();

  if(_storageData) {
    for(let i=_start; i<_limit; i++) {
      if(_storageData[i]) {
        let tr = document.createElement("tr");
        let th_no = document.createElement("th");
        let td_title = document.createElement("td");
        let td_content = document.createElement("td");
        let td_date = document.createElement("td");
        let td_action = document.createElement("td");

        th_no.setAttribute('scope', 'row');
        th_no.innerText = _storageData[i].no;
        td_title.innerText = _storageData[i].title;
        td_content.innerText = _storageData[i].content.length > 20 ? _storageData[i].content.substr(0, 20) + '...' : _storageData[i].content; //20글자 뒤에는 ... 으로 처리
        td_date.innerText = _storageData[i].date;
        td_action.innerHTML = `
          <i class="bi bi-file-text" onClick="detailItem(`+_storageData[i].no+`)"></i>
          <i class="bi bi-trash-fill" onClick="deleteItem(`+_storageData[i].no+`)"></i>
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

//게시물 목록 지우기
function boardListRemove() {
  let dataTable = document.getElementById('dataTable');
  while (dataTable.hasChildNodes() ) {
    dataTable.removeChild( dataTable.firstChild); 
  }
}

//페이지 컨트롤 영역 그리기
function renderPagination(totalCount, currentPage) {
  if (totalCount.length <= 10) return; //게시물 데이터가 10개 이하이면 페이지 영역을 그리지 않는다.
  
  let totalPage = Math.ceil(totalCount.length / 10); //페이징 목록의 총 개수를 구한다.
  let pageGroup = Math.ceil(currentPage / 10); //한 페이징 목록은 10개씩 구성한다.

  let last = pageGroup * 10;
  if (last > totalPage) last = totalPage;
  let first = last - (10 - 1) <= 0 ? 1 : last - (10 - 1);
  let next = last + 1;
  let prev = first - 1;

  let pageList = document.createElement('ul');
  pageList.id = 'page_ul';
  pageList.className = 'pagination';

  if (prev > 0) { //이전페이징 버튼
    const preli = document.createElement('li');
    preli.className = 'page-item';
    preli.onclick = () => prePage(first);
    preli.insertAdjacentHTML("beforeend", `<span class="page-link">Previous</span>`);
    pageList.appendChild(preli);
  }
	
  for (let i = first; i <= last; i++) { //페이징목록 숫자 버튼
    const li = document.createElement("li");
    li.className = 'page-item-' + i;
    li.onclick = () => movePage(i);
    li.insertAdjacentHTML("beforeend", `<a class="page-link" href="#">${i}</a>`);
    pageList.appendChild(li);
  }

  if (last < totalPage) { //다음페이징 버튼
    const endli = document.createElement('li');
    endli.className = 'page-item';
    endli.onclick = () => nextPage(last);
    endli.insertAdjacentHTML("beforeend", `<a class="page-link" href="#">Next</a>`);
    pageList.appendChild(endli);
  }

  document.getElementById('page_area').appendChild(pageList); //최종 페이징을 HTML에 바인딩

  let pageItem = document.getElementsByClassName(`page-item-${currentPage}`);
  pageItem[0].classList.add("active"); //페이징 번호 active 스타일 적용 처리
};

//페이지 이동
function movePage(page) {
  _page = page;
  _start = Number(String(page) + '0') - 10;
  _limit = Number(String(page) + '0');

  let activeItem = document.getElementsByClassName('active'); 
  activeItem[0].classList.remove('active') //기존 active 스타일 제거
  let pageItem = document.getElementsByClassName(`page-item-${page}`);
  pageItem[0].classList.add("active"); //페이징 번호 active 스타일 적용 처리

  boardListAction();
}

//페이징 다음 목록 이동
function nextPage(last) {
  let page_ul = document.getElementById('page_ul');
  while (page_ul.hasChildNodes() ) {
    page_ul.removeChild(page_ul.firstChild); 
  }
  page_ul.remove();

  renderPagination(_storageData, last+1); //다음 페이지는 10의배수+1에서 시작
  movePage(last+1)
}

//페이징 이전 목록 이동
function prePage(first) {
  let page_ul = document.getElementById('page_ul');
  while (page_ul.hasChildNodes() ) {
    page_ul.removeChild(page_ul.firstChild); 
  }
  page_ul.remove();

  renderPagination(_storageData, first-10); //이전 페이지는 현재의 시작페이지의 -10에서 시작
  movePage(first-10)
}

function modalOpen(type) {
  document.getElementsByClassName("modal-backdrop")[0].style.display = "block";
  document.getElementsByClassName("modal")[0].style.display = "block";
  _mode = type;
  modalModeSet();
}

function modalClose() {
  document.getElementsByClassName("modal-backdrop")[0].style.display = "none";
  document.getElementsByClassName("modal")[0].style.display = "none";
  _mode = '';
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
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