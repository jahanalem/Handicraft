using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models;
using Umbraco.Web;

namespace Jahan.Handicraft.Model.UModel
{
    class BannerCollection : BaseEntity
    {
        public override void Initialize(IPublishedContent content, CultureInfo culture)
        {
            throw new NotImplementedException();
        }

        public static List<Banner> Get(IPublishedContent content, string docTypeOfTargetNode, CultureInfo culture)
        {
            List<Banner> result = new List<Banner>();
            IPublishedContent targetNode = content.Children.Where(c => c.DocumentTypeAlias.Equals(docTypeOfTargetNode)).SingleOrDefault();
            if (targetNode != null)
            {
                IEnumerable<IPublishedContent> bannerList = targetNode.Children;//.Where(c => c.DocumentTypeAlias.Equals("Banner")).ToList();
                if (bannerList != null)
                {
                    foreach (var banner in bannerList)
                    {
                        var r = new Banner {Description = banner.GetPropertyValue<string>("Description")};
                        result.Add(r);
                    }
                }
            }
            return result;
        } 
    }
}
