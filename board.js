let _storageData = null;
let _boardNo = null;
let _page = 1;
let _start = 0;
let _limit = 10;

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
  renderPagination(_storageData, _page);
}

function modalModeSet() {
  let titleType = document.getElementById("titleType");
  let modalButton = document.getElementById("modalButton");
  let name = document.getElementById("name");

  if(mode == 'Add') {
    titleType.innerHTML = '글 등록';
    modalButton.innerHTML = '등록';
    document.getElementById("commnet-area").style.display = "none";
  } else if(mode == 'Detail') {
    titleType.innerHTML = '글 상세';
    modalButton.innerHTML = '수정모드';
    document.getElementById("commnet-area").style.display = "flex";
    name.value = randName();
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
  let date = new Date();

  date = dateFormat(date);
  const index = _storageData.findIndex((data) => {
    return data.no == _boardNo;
  });

  let detail;
  let comment = _storageData.filter((data) => {
    return data.no == _boardNo;
  });
  if(comment[0].commentList == undefined) {
    detail = {
      no: _boardNo,
      title: title,
      content: content,
      date: date,
    };
  } else {
    detail = {
      no: _boardNo,
      title: title,
      content: content,
      date: date,
      commentList: comment[0].commentList,
    }
  }

  _storageData[index] = {...detail};

  window.localStorage.setItem('storageList',JSON.stringify(_storageData));
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
        const title = _storageData[i].commentList ? _storageData[i].title + ' (' + _storageData[i].commentList.length + ')' : _storageData[i].title;
        td_title.innerText = title;
        td_content.innerText = _storageData[i].content.length > 20 ? _storageData[i].content.substr(0, 20) + '...' : _storageData[i].content; //20글자 뒤에는 ... 으로 처리
        td_date.innerText = _storageData[i].date;
        td_action.innerHTML = `
          <i class="bi bi-file-text" onClick="detailItem(${_storageData[i].no})" style="cursor: pointer;"></i>
          <i class="bi bi-trash-fill" onClick="deleteItem(${_storageData[i].no})" style="cursor: pointer;"></i>
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
  
  let totalPage = Math.ceil(totalCount.length / 10);
  let pageGroup = Math.ceil(currentPage / 10);

  let last = pageGroup * 10;
  if (last > totalPage) last = totalPage;
  let first = last - (10 - 1) <= 0 ? 1 : last - (10 - 1);
  let next = last + 1;
  let prev = first - 1;

  let pageList = document.createElement('ul');
  pageList.id = 'page_ul';
  pageList.className = 'pagination';

  if (prev > 0) {
    const preli = document.createElement('li');
    preli.className = 'page-item';
    preli.onclick = () => prePage(first);
    preli.insertAdjacentHTML("beforeend", `<span class="page-link">Previous</span>`);
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

  document.getElementById('page_area').appendChild(pageList);

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
  let detail = _storageData.filter((data) => {
    return data.no == no;
  });
  let title = document.getElementById('title');
  let content = document.getElementById('content');
  title.value = detail[0].title;
  content.value = detail[0].content;
  title.readOnly = true;
  content.readOnly = true;
  _boardNo = no;

  if(detail[0].commentList) {
    commentListAction(detail[0].commentList);
  } else {
    //기존 댓글 목록 지움
    let dataComment = document.getElementById('dataComment');
    while (dataComment.hasChildNodes() ) {
      dataComment.removeChild( dataComment.firstChild); 
    }
  }
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

//댓글 목록 불러오기
function commentListAction(commentList) {
  //기존 댓글 목록 지움
  let dataComment = document.getElementById('dataComment');
  while (dataComment.hasChildNodes() ) {
    dataComment.removeChild( dataComment.firstChild); 
  }

  commentList.map(data => {
    let li = document.createElement("li");
    li.innerHTML = `
      <i class="bi bi-person-circle" style="color:gray">`+data.name + ` ` + data.date+`</i>
      <div style="display: flex; justify-content: space-between;">
        <p>`+data.comment+`</p>
        <div>
          <i class="bi bi-pencil-square" onClick="commentEdit(${data.no})" style="cursor: pointer;"></i>
          <i class="bi bi-x-square" onClick="commentDelete(${data.no})" style="cursor: pointer;"></i>
        </div>
      </div>
      <hr>
    `;
    dataComment.appendChild(li);
  });
}

//댓글 등록
function commentSave() {
  const name = document.getElementById('name').value;
  let comment = document.getElementById('comment').value;
  let date = new Date();
  date = dateFormat(date);
  let detail = _storageData.filter((data) => {
    return data.no == _boardNo;
  });
  
  if(detail[0].commentList == undefined) {
    detail[0].commentList = new Array();
    detail[0].commentList.push({
      no: 1, 
      name: name, 
      comment: comment, 
      date: date
    });
  } else {
    let lastIndex = detail[0].commentList.slice(-1)[0].no;

    detail[0].commentList = 
    [
      ...detail[0].commentList, 
      {
        no: lastIndex+1, 
        name: name, 
        comment: comment, 
        date: date
      }
    ];
  };

  window.localStorage.setItem('storageList',JSON.stringify(_storageData));
  document.getElementById('comment').value = '';
  commentListAction(detail[0].commentList);
  boardListAction();
  document.getElementById('dataComment').scrollTop = document.getElementById('dataComment').scrollHeight;
}

//댓글 삭제
function commentDelete(no) {
  if (confirm('댓글을 삭제하시겠습니까?') === true) {
    for(let i=0; i<_storageData.length; i++) {
      if(_storageData[i].no == _boardNo){
        _storageData[i].commentList = _storageData[i].commentList.filter(function(data) {
          return data.no != no;
        });
        window.localStorage.setItem('storageList',JSON.stringify(_storageData));
        commentListAction(_storageData[i].commentList);
        boardListAction();
        break;
      }
    }
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

function randName() {
  let text = "";
  let first = "김이박최정강조윤장임한오서신권황안송류전홍고문양손배조백허유남심노정하곽성차주우구신임나전민유진지엄채원천방공강현함변염양변여추노도소신석선설마주연방위표명기반왕모장남탁국여진구";
  let last = "가강건경고관광구규근기길나남노누다단달담대덕도동두라래로루리마만명무문미민바박백범별병보사산상새서석선설섭성세소솔수숙순숭슬승시신아안애엄여연영예오옥완요용우원월위유윤율으은의이익인일자잔장재전정제조종주준중지진찬창채천철초춘충치탐태택판하한해혁현형혜호홍화환회효훈휘희운모배부림봉혼황량린을비솜공면탁온디항후려균묵송욱휴언들견추걸삼열웅분변양출타흥겸곤번식란더손술반빈실직악람권복심헌엽학개평늘랑향울련";

  for (var i = 0; i < 1; i++)
    text += first.charAt(Math.floor(Math.random() * first.length));
  for (var i = 0; i < 2; i++)
    text += last.charAt(Math.floor(Math.random() * last.length));

  return text;
}