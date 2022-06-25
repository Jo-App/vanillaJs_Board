let _storageData = null;
let _page = 0;
let _start = 0;
let _limit = 10;

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
  boardListAction();
  renderPagination(_storageData, _page+1);
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

  document.getElementById('page_area').appendChild(pageList);

  let pageItem = document.getElementsByClassName(`page-item-${currentPage}`);
  pageItem[0].classList.add("active");
};

//페이지 이동
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

//페이징 다음 목록 이동
function nextPage(last) {
  let page_ul = document.getElementById('page_ul');
  while (page_ul.hasChildNodes() ) {
    page_ul.removeChild(page_ul.firstChild); 
  }
  page_ul.remove();

  renderPagination(_storageData, last+1);
  movePage(last+1)
}

//페이징 이전 목록 이동
function prePage(first) {
  let page_ul = document.getElementById('page_ul');
  while (page_ul.hasChildNodes() ) {
    page_ul.removeChild(page_ul.firstChild); 
  }
  page_ul.remove();

  renderPagination(_storageData, first-10);
  movePage(first-10)
}

dataSet();