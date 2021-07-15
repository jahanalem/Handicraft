using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Jahan.Handicraft.Model.UModel.Helper
{
    public static class SeprateStringByChar
    {
        public static string FirstPartOfString(this string str, char seprated, string errorMessage)
        {
            if (str != null && str.Contains(seprated))
            {
                return str.Split(seprated)[0];
            }
            return errorMessage;
        }
        public static string SecondPartOfString(this string str, char seprated, string errorMessage)
        {
            if (str != null && str.Contains(seprated))
            {
                return str.Split(seprated)[1];
            }
            return errorMessage;
        }
    }
}
