//data.json 내용을 로컬스토리지에 문자형식으로 넣는다.
async function dataSet() {
  const data = await fetch("./data.json")
  .then(response => {
    return response.json();
  });
  window.localStorage.setItem('storageList',JSON.stringify(data));
}

//로컬스토리지의 내용을 읽어서 테이블에 데이터를 바인딩시킨다. 
function boardListAction() {
  let storageList = JSON.parse(window.localStorage.getItem('storageList'));
  const dataTable = document.getElementById('dataTable');

  storageList.forEach(data => {
    let tr = document.createElement("tr");
    let th_no = document.createElement("th");
    let td_title = document.createElement("td");
    let td_content = document.createElement("td");
    let td_date = document.createElement("td");

    th_no.setAttribute('scope', 'row');

    th_no.innerText = data.no;
    td_title.innerText = data.title;
    td_content.innerText = data.content.substr(0, 20) + '...'; //20글자 뒤에는 ... 으로 처리
    td_date.innerText = data.date;

    tr.appendChild(th_no);
    tr.appendChild(td_title);
    tr.appendChild(td_content);
    tr.appendChild(td_date);

    dataTable.appendChild(tr)

  });
}

dataSet();
boardListAction();