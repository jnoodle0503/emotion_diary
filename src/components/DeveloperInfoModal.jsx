
import React from 'react';
import './DeveloperInfoModal.css';

function DeveloperInfoModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>개발자 정보</h2>
        <p>이메일: jnoodle0503@gmail.com</p>
        <p>블로그: <a href="https://whitemackerel.tistory.com" target="_blank" rel="noopener noreferrer">https://whitemackerel.tistory.com</a></p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export default DeveloperInfoModal;
