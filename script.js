//r = 1时，读取密钥
//r = 0时，读取输入信息（明文或密文）

function readfile(f, r)
{
	var reader = new FileReader();
	reader.readAsText(f);
	reader.onload = function()
	{
		var text = reader.result;
		if (r)
		{
			if (text.length > 16)
			{
				window.alert("密钥不能超过64bit！");
				return;
			}
			document.form.key.value = "";
			document.form.key.value = text;
		}
		else
		{
			document.form.input.value = "";
			document.form.input.value = text;
		}
	};
	reader.onerror = function(e)
	{
		console.log("Error", e);
	};
}

var ERROR_VAL = -9876;

//初始向量值，可修改
var IV = new Array(-1,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

//见https://en.wikipedia.org/wiki/DES_supplementary_material
//变换矩阵IP
var IP_perm = new Array(-1,
	58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
	62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
	57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
	61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7);

//变换矩阵IP^-1
var IPT_perm = new Array(-1,
	40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
	38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
	36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
	34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25);

//变换矩阵E
var E_perm = new Array(-1,
	32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11,
	12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21,20, 21,
	22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1);

//S盒变换
var S0 = new Array(
	14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
	0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
	4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
	15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13);
var S1 = new Array(
	15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
	3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
	0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
	13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9);
var S2 = new Array(
	10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
	13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
	13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
	1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12);
var S3 = new Array(
	7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
	13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
	10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
	3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14);
var S4 = new Array(
	2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
	14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
	4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
	11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3);
var S5 = new Array(
	12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
	10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
	9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
	4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13);
var S6 = new Array(
	4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
	13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
	1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
	6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12);
var S7 = new Array(
	13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
	1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
	7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
	2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11);

//在完成S盒的操作后，再把S盒的输出重新组合成一个32比特的矩阵，并进行一次坐标置换
//置换P
var P_perm = new Array(-1,
	16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10,
	2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25);

//变换矩阵IPC
var IPC_perm = new Array(-1,
	57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
	10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
	63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
	14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4);

//下标置换PC
var PC_perm = new Array(-1,
	14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10,
	23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
	41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
	44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32);

//清除空格
function remove_spaces(instr)
{
	var i;
	var outstr = "";

	for (i = 0; i < instr.length; ++i)
		if (instr.charAt(i) != " ")
			outstr += instr.charAt(i);
	return outstr;
}

//将每个字符拆分为二进制位并存入数组
function split_int(ary, start, bitc, val)
{
   var i = start;
   var j;
   for (j = bitc - 1; j >= 0; --j)
   {
      ary[i + j] = val & 1;
      val >>= 1;
   }
}

function get_value_of_key(bitarray, str, ASCII_flag)
{
	var i = 0, val = 0;
	bitarray[0] = -1;
	if (ASCII_flag)
	{
		if ( str.length != 8 )
		{
			window.alert("密钥必须是64位二进制数！");
			bitarray[0] = ERROR_VAL;
			return
		}
		for (i = 0; i < 8; ++i)
		{
			split_int(bitarray, i * 8 + 1, 8, str.charCodeAt(i));
		}
	}
	else
	{
      	//输入是二进制数
      	str = remove_spaces(str);
      	if (str.length != 64)
      	{
         	window.alert("密钥必须是64位二进制数！");
         	bitarray[0] = ERROR_VAL;
         	return;
      	}
      	for (i = 0; i < 64; ++i)
      	{
         	//得到第i位二进制位
         	val = str.charCodeAt(i);
         	//将字符转为数字
         	if (val == 48)
            	val = 0;
         	else if ( val == 49)
            	val = 1;
         	else
         	{
    			window.alert(str.charAt(i) + "不是二进制位!");
            	bitarray[0] = ERROR_VAL;
            	return;
         	}
         	split_int(bitarray, i + 1, 1, val);
      	}
   	}
}

function get_value(in_str, ASCII_flag)
{
	str = in_str.slice(0);
	var i = 0, j = 0;
	var inData;
	var val = 0;
	var s = 0;
	var n = 0;

	if (ASCII_flag)
	{
		if ((str.length % 8) != 0)
		{
			if (str.length < 8)
			{
				s = 8 - str.length;
				n = 1;
			}
			else
			{
				n = Math.ceil(str.length / 8);
				s = 8 - (str.length - ( 8 * Math.floor(str.length / 8)));
			}
			for (i = 0; i < s; ++i) //字符串末尾置0
				str += "\0";
		}
		else
		{
			n = str.length / 8;
		}
		inData = new Array(n);
		for (j = 0; j < n; ++j)
		{
			inData[j] = new Array(65);
			for (i = 0; i < 8; ++i)
				split_int(inData[j], i * 8 + 1, 8, str.charCodeAt(i + 8 * j));
		}
   }
   else
   {
		str = remove_spaces(str);

		if (((str.length % 64) > 0) && (str.length % 64 <= 56))
		{
			if (str.length < 64)
			{
				s = 64 - str.length;
				n = 1;
			}
			else
			{
				n = Math.ceil(str.length / 64);
				s = 64 - (str.length - (64 * Math.floor(str.length / 64)));
			}
			var CBCPI = (64 - (str.length % 64) - 8);
			var cbcpistr = "";
			cbcpistr = CBCPI.toString(2);
			if (cbcpistr.length < 8)
			{
				var s0sup = "";
				for (var cnt = cbcpistr.length; cnt < 8; ++cnt)
				{
					s0sup += "0"
				}
				cbcpistr = s0sup + cbcpistr;
			}
			//alert(cbcpister);
			var s0 = "";
			for (i = str.length % 64; i < 56; ++i) //补全str
			{
				var randnum = Math.random();
				var num = Math.round(randnum)
				s0 += num;
			}
			str = str + s0 + cbcpistr;
			//alert(str);
		}
		else if ((str.length % 64) == 0)
		{
			var s0 = "";
			n = Math.ceil(str.length / 64) + 1;
			for (i = 0; i < 56; ++i) //补全str
			{
				var randnum = Math.random();
				var num = Math.round(randnum);
				s0 += num;
			}
			str = str + s0 + "00111000";
		}
		else
		{
			var CBCPI = (64 - (str.length % 64) + 56);
			var cbcpistr = "";
			cbcpistr = CBCPI.toString(2);
			if (cbcpistr.length < 8)
			{
				var s0sup = "";
				for (var cnt = cbcpistr.length; cnt < 8; ++cnt)
				{
					s0sup += "0"
				}
				cbcpistr = s0sup + cbcpistr;
			}
			n = Math.ceil(str.length / 64) + 1;
			var s0 = "";
			for (i = str.length % 64; i < 56 + 64; ++i)
			{
				var randnum = Math.random();
				var num = Math.round(randnum)
				s0 += num;
			}
			str = str + s0 + cbcpistr;
		}
		inData = new Array (n);
		for (j = 0; j < n; ++j)
		{
			inData[j] = new Array(65);
			for (i = 0; i < 64; ++i)
			{
				val = str.charCodeAt(i + 64 * j);
				//alert(val);
				if (val == 48)
					val = 0;
				else if (val == 49)
					val = 1;
				else
				{
					window.alert(str.charAt(i) + "不是二进制位!");
					return;
				}
				split_int(inData[j], i + 1, 1, val);
				//alert(inData);
			}
		}
   }
   return inData;
}

function get_value_special(in_str, ASCII_flag)
{
	str = in_str.slice(0);
	var i = 0, j = 0;
	var inData;
	var val = 0;
	var s = 0;
	var n = 0;

	if (ASCII_flag)
	{
		if ((str.length % 8) != 0)
		{
			if (str.length < 8)
			{
				s = 8 - str.length;
				n = 1;
			}
			else
			{
				n = Math.ceil(str.length / 8);
				s = 8 - (str.length - ( 8 * Math.floor(str.length / 8)));
			}
			for (i = 0; i < s; ++i) //字符串末尾置0
				str += "\0";
		}
		else
		{
			n=str.length / 8;
		}
		inData = new Array (n);
		for (j = 0; j < n; ++j)
		{
			inData[j] = new Array(65);
			for (i = 0; i < 8; ++i)
				split_int(inData[j], i * 8 + 1, 8, str.charCodeAt(i + 8 * j));
		}
   }
   else
   {
		str = remove_spaces(str);

		if ((str.length % 64) != 0)
		{
			if (str.length < 64)
			{
				s = 64 - str.length;
				n = 1;
			}
			else
			{
				n = Math.ceil(str.length / 64);
				s = 64 - (str.length - (64 * Math.floor(str.length / 64)));
			}
			var s0 = "";
			for (i = 0; i < s; ++i) //补全str
				s0 += "0";
			str = s0 + str;
		}
		else
		{
			n = str.length / 64;
		}
		inData = new Array (n);
		for (j = 0; j < n; ++j)
		{
			inData[j] = new Array(65);
			for (i = 0; i < 64; ++i)
			{
				val = str.charCodeAt(i + 64 * j);
				//alert(val);
				if (val == 48)
					val = 0;
				else if (val == 49)
					val = 1;
				else
				{
					window.alert("字符串中有不是二进制位的字符!");
					return;
				}
				split_int(inData[j], i + 1, 1, val);
				//alert(inData);
			}
		}
   }
   return inData;
}

function format_DES_output(DES_output)
{
   	var i = 0;
   	var j = 0;
   	var bits;
   	var str = "";

   	//1 = ASCII
   	//0 = hex
   	/*if (document.form.output_type[0].checked)
   	{
		for (j = 0; j < DES_output.length; ++j)
		{
      		for (i = 1; i <= 64; i += 8)
      		{
            	str += String.fromCharCode(DES_output[j][i] * 128 + DES_output[j][i + 1] * 64 + DES_output[j][i + 2] * 32 + DES_output[j][i + 3] * 16 + DES_output[j][i + 4] * 8 + DES_output[j][i + 5] * 4 + DES_output[j][i + 6] * 2 + DES_output[j][i + 7]);
      		}
		}
   	}*/
   	//else
   	//{
	   	for (j = 0; j < (DES_output.length); ++j)
	   	{
		   	for (i = 1; i <= 64; ++i)
		   	{
			   	bits = DES_output[j][i];
			   	str += String.fromCharCode(bits + 48);
		   	}
	   	}
   	//}

   	//输出到文本框
   	document.form.output.value = str;
}

function permute(dest, src, perm)
{
	var i;
	var fromloc;

	for (i = 1; i < perm.length; ++i)
	{
		fromloc = perm[i];
    	dest[i] = src[fromloc];
  	}
}

//抑或
function xor(a1, a2)
{
   	var i;

   	for (i = 1; i < a1.length; ++i)
      	a1[i] = a1[i] ^ a2[i];
}

function xor_from_zero_str(a1, a2)
{
   	var i;

   	for (i = 0; i < a1.length; ++i)
      	a1[i] = a1[i] ^ a2[i];
}

//S盒变换
function do_S(SBox, index, inbits)
{
	var S_index = inbits[index] * 32 + inbits[index + 5] * 16 + inbits[index + 1] * 8  + inbits[index + 2] * 4 + inbits[index + 3] * 2  + inbits[index + 4];
   	return SBox[S_index];
}

//DES加密轮函数
function des_round(L, R, KeyR)
{
   	var E_result = new Array(49);
   	var S_out = new Array(33);
   	var temp_L = new Array(33);
   	for (i = 0; i < 33; ++i)
   	{
	   	temp_L[i] = L[i];
	   	L[i] = R[i];
   	}

   	permute( E_result, R, E_perm );

   	xor( E_result, KeyR );

   	//S盒
   	split_int(S_out, 1, 4, do_S(S0,  1, E_result));
   	split_int(S_out, 5, 4, do_S(S1,  7, E_result));
   	split_int(S_out, 9, 4, do_S(S2, 13, E_result));
   	split_int(S_out, 13, 4, do_S(S3, 19, E_result));
   	split_int(S_out, 17, 4, do_S(S4, 25, E_result));
   	split_int(S_out, 21, 4, do_S(S5, 31, E_result));
   	split_int(S_out, 25, 4, do_S(S6, 37, E_result));
   	split_int(S_out, 29, 4, do_S(S7, 43, E_result));

   	permute(R, S_out, P_perm);
	xor(R, temp_L);
}

//CD左移1位
function shift_CD_1(CD)
{
   	var i;
   	for (i = 0; i <= 55; ++i)
	{
      	CD[i] = CD[i + 1];
	}
	CD[56] = CD[28];
   	CD[28] = CD[0];
}

//CD左移2位
function shift_CD_2(CD)
{
   	var i;
   	var C1 = CD[1];
   	for (i = 0; i <= 54; ++i)
      	CD[i] = CD[i + 2];

   	CD[55] = CD[27];
   	CD[56] = CD[28];
   	CD[27] = C1;
   	CD[28] = CD[0];
}

// DES加密
function des_encrypt(inData, Key, encrypt_flag)
{
   	var tempData = new Array(65);
   	var CD = new Array(57);
   	var KS = new Array(16);
   	var L = new Array(33);
   	var R = new Array(33);
   	var result = new Array (65);
   	var i = 0, j = 0;
   	/*for(i = 0; i < result.length; ++i)
		result[i] = new Array (65);
	i = 0;*/

   	permute(CD, Key, IPC_perm);

   	for (i = 1; i <= 16; ++i)
   	{
      	KS[i] = new Array(49);

      	if (i==1 || i==2 || i==9 || i == 16)
         	shift_CD_1(CD);
      	else
         	shift_CD_2(CD);

      	//生成子密钥
      	permute(KS[i], CD, PC_perm);
   	}
	//for (j = 0; j < inData.length; ++j)
	//{
		permute(tempData, inData, IP_perm);

		//分成左右两段
		for (i = 1; i <= 32; ++i)
		{
			L[i] = tempData[i];
			R[i] = tempData[i + 32];
		}

		//encrypt_flag = 1时，加密
		//encrypt_flag = 0时，解密
		if (encrypt_flag)
		{
			for (i = 1; i <= 6; ++i)
			{
				des_round(L, R, KS[i]);
			}
		}
		else
		{
			for (i = 6; i >= 1; --i)
			{
				des_round(L, R, KS[i]);
			}
		}

		for (i = 1; i <= 32; ++i)
		{
			tempData[i] = R[i];
			tempData[i + 32] = L[i];
		}
		permute(result, tempData, IPT_perm);
	//}
	return result.join("");
}

function main(encrypt_flag)
{
	var inData;
   	var Key = new Array(65);
   	var DES_output = "";
	if (encrypt_flag == 1) {
		alert(document.form.input.value);
   		inData = get_value(document.form.input.value, 0/*document.form.input_type[0].checked*/);
	}
	else
		inData = get_value_special(document.form.input.value, 0);
   	get_value_of_key(Key, document.form.key.value, 0/*document.form.key_type[0].checked*/);
   	if (Key[0] == ERROR_VAL)
      	return;

	var len = inData.length;
	if (encrypt_flag == 1)
	{
		var lastresultarr = new Array(64);
		for (var i = 0; i < len; ++i)
		{
			//var nexttextarr = new Array(64);
			if (i == 0)
			{
				var IVarr = new Array(65);
				for (var j = 0; j < 65; ++j)
					IVarr[j] = IV[j];
				//resultarr = des_encrypt(inData[i], Key, encrypt_flag).split("");
				xor(IVarr, inData[0]);
				DES_output = DES_output + des_encrypt(IVarr, Key, encrypt_flag);
				lastresultarr = des_encrypt(inData[i], Key, encrypt_flag).split("");
				for (var j = 64; j > 0; --j)
				{
					lastresultarr[j] = lastresultarr[j - 1]
				}
				lastresultarr[0] = -1
			}
			else
			{
				xor(lastresultarr, inData[i]);
				DES_output = DES_output + des_encrypt(lastresultarr, Key, encrypt_flag);
				lastresultarr = des_encrypt(lastresultarr, Key, encrypt_flag).split("");
				for (var j = 64; j > 0; --j)
				{
					lastresultarr[j] = lastresultarr[j - 1]
				}
				lastresultarr[0] = -1
			}
		}
	}
	else
	{
		var nextresult = "";
		var lasttext = "";
		for (var i = 0; i < len; ++i)
		{
			if (i != 0)
			{
				nextresult = des_encrypt(inData[i], Key, encrypt_flag)
				var lasttextarr = new Array(64);
				var nextresultarr = new Array(64);
				lasttextarr = lasttext.split("");
				nextresultarr = nextresult.split("");
				xor_from_zero_str(lasttextarr, nextresultarr);
   				DES_output = DES_output + lasttextarr.join("");
				lasttext = inData[i].join("");
			}
			else
			{
				var IVarr = new Array(65);
				for (var j = 0; j < 65; ++j)
					IVarr[j] = IV[j];
				var result0 = new Array(64);
				result0 = des_encrypt(inData[i], Key, encrypt_flag).split("");
				xor(result0, IVarr);
				DES_output = DES_output + result0.join("");
				//alert(DES_output);
				lasttext = inData[i].join("");
			}
		}
	}
   	//format_DES_output(DES_output);
	if (encrypt_flag == 1)
	{
		alert("加密完成！");
		document.form.output.value = DES_output;
	}
	else
	{
		alert("解密完成！");
		var signal = new Array(8);
		var outputarr = new Array(DES_output.length);
		var j = 0;
		outputarr = DES_output.split("");
		//alert(DES_output.length);
		for (var i = DES_output.length - 8; i < DES_output.length; ++i)
		{
			signal[j++] = outputarr[i];
		}
		var signalval = (128 * signal[0] + 64 * signal[1] + 32 * signal[2] + 16 * signal[3] + 8 * signal[4] + 4 * signal[5] + 2 * signal[6] + 1 * signal[7]);
		var i;
		var finalresult = new Array(DES_output.length - signalval - 8);
		for (i = 0; i < DES_output.length - signalval - 8; ++i)
		{
			finalresult[i] = outputarr[i];
		}
		finalresult[i] = "\0";
		document.form.output.value = finalresult.join("");
	}
}
